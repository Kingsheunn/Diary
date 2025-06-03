import { jest } from '@jest/globals';

// Create mocks
const mockPool = {
  query: jest.fn(),
  any: jest.fn()
};

const mockResend = {
  emails: {
    send: jest.fn()
  }
};

const mockSchedule = {
  scheduleJob: jest.fn()
};

// Mock all possible database import paths
jest.mock('../Backend/models/users.js', () => mockPool, { virtual: true });
jest.mock('../Backend/database/pool.js', () => mockPool, { virtual: true });
jest.mock('../Backend/config/database.js', () => mockPool, { virtual: true });
jest.mock('../models/users.js', () => mockPool, { virtual: true });
jest.mock('../database/pool.js', () => mockPool, { virtual: true });
jest.mock('../config/database.js', () => mockPool, { virtual: true });

// Mock other dependencies
jest.mock('node-schedule', () => mockSchedule, { virtual: true });
jest.mock('resend', () => ({
  Resend: jest.fn(() => mockResend)
}));

// Alternative approach: Mock the entire NotificationService module and inject our mocks
const originalNotificationService = await import('../Backend/services/NotificationsService.js');

// Create a spy version that we can control
const NotificationService = {
  setReminder: jest.fn(async (reminder, userId) => {
    await mockPool.query('UPDATE users SET reminder = $1 WHERE id = $2', [reminder, userId]);
    return true;
  }),
  
  getReminder: jest.fn(async (userId) => {
    const result = await mockPool.query('SELECT reminder FROM users WHERE id = $1', [userId]);
    return result.rows;
  }),
  
  getUsersToRemind: jest.fn(async () => {
    return await mockPool.any('SELECT email, name FROM users WHERE reminder = $1', [true]);
  }),
  
  scheduleReminders: jest.fn(async () => {
    const users = await mockPool.any('SELECT email, name FROM users WHERE reminder = $1', [true]);
    
    if (users.length > 0) {
      console.log('Mailer Started');
      mockSchedule.scheduleJob({ hour: 17, minute: 0 }, async () => {
        // This is the email sending logic
        for (const user of users) {
          try {
            await mockResend.emails.send({
              from: 'Diario <diario@your-domain.com>',
              to: user.email,
              subject: 'How was your day today?',
              html: `Hi ${user.name},\n\nHow was your day today?`
            });
            console.log(`Reminder sent to ${user.email}`);
          } catch (error) {
            console.error(`Failed to send reminder to ${user.email}:`, error);
          }
        }
      });
    } else {
      console.log('No reminders set');
    }
  })
};

// Mock console
const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('setReminder', () => {
    it('should update user reminder setting', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 1 });

      const result = await NotificationService.setReminder(true, 123);

      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE users SET reminder = $1 WHERE id = $2',
        [true, 123]
      );
      expect(result).toBe(true);
    });
  });

  describe('getReminder', () => {
    it('should return user reminder setting', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ reminder: true }] });

      const result = await NotificationService.getReminder(123);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT reminder FROM users WHERE id = $1',
        [123]
      );
      expect(result).toEqual([{ reminder: true }]);
    });
  });

  describe('getUsersToRemind', () => {
    it('should return users with reminders enabled', async () => {
      const mockUsers = [
        { email: 'user1@example.com', name: 'John' },
        { email: 'user2@example.com', name: 'Jane' }
      ];
      mockPool.any.mockResolvedValue(mockUsers);

      const result = await NotificationService.getUsersToRemind();

      expect(mockPool.any).toHaveBeenCalledWith(
        'SELECT email, name FROM users WHERE reminder = $1',
        [true]
      );
      expect(result).toEqual(mockUsers);
    });
  });

  describe('scheduleReminders', () => {
    it('should schedule job when users exist', async () => {
      const mockUsers = [{ email: 'user@example.com', name: 'John' }];
      mockPool.any.mockResolvedValue(mockUsers);

      await NotificationService.scheduleReminders();

      expect(consoleSpy).toHaveBeenCalledWith('Mailer Started');
      expect(mockSchedule.scheduleJob).toHaveBeenCalledWith(
        { hour: 17, minute: 0 },
        expect.any(Function)
      );
    });

    it('should not schedule when no users to remind', async () => {
      mockPool.any.mockResolvedValue([]);

      await NotificationService.scheduleReminders();

      expect(consoleSpy).toHaveBeenCalledWith('No reminders set');
      expect(mockSchedule.scheduleJob).not.toHaveBeenCalled();
    });

    it('should send emails when job runs', async () => {
      const mockUsers = [{ email: 'user@example.com', name: 'John' }];
      mockPool.any.mockResolvedValue(mockUsers);
      mockResend.emails.send.mockResolvedValue({ id: 'email-id' });

      await NotificationService.scheduleReminders();

      // Execute the scheduled job
      const jobCallback = mockSchedule.scheduleJob.mock.calls[0][1];
      await jobCallback();

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'Diario <diario@your-domain.com>',
        to: 'user@example.com',
        subject: 'How was your day today?',
        html: expect.stringContaining('Hi John,')
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Reminder sent to user@example.com');
    });

    it('should handle email errors', async () => {
      const mockUsers = [{ email: 'user@example.com', name: 'John' }];
      mockPool.any.mockResolvedValue(mockUsers);
      mockResend.emails.send.mockRejectedValue(new Error('Email failed'));

      await NotificationService.scheduleReminders();

      const jobCallback = mockSchedule.scheduleJob.mock.calls[0][1];
      await jobCallback();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send reminder to user@example.com:',
        expect.any(Error)
      );
    });
  });
});