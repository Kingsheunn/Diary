import validateSignIn from '../Backend/validators/validateSignIn.js';
import validateSignUp from '../Backend/validators/validateSignUp.js';

describe('Validation Middleware', () => {
  describe('SignIn Validation', () => {
    it('should validate correct signin data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const { error } = validateSignIn(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };
      const { error } = validateSignIn(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123'
      };
      const { error } = validateSignIn(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('SignUp Validation', () => {
    it('should validate correct signup data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      const { error } = validateSignUp(validData);
      expect(error).toBeUndefined();
    });

    it('should reject missing name field', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const { error } = validateSignUp(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject short name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'A'
      };
      const { error } = validateSignUp(invalidData);
      expect(error).toBeDefined();
    });
  });
});