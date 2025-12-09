/**
 * Property 2: Role Authorization Consistency
 * Validates: Requirements 2.2, 2.3
 * 
 * Property: Role-based access control must be consistent
 * - ADMIN role always has access to all endpoints
 * - Users with correct role always get access
 * - Users without correct role always get denied
 */

import * as fc from 'fast-check';
import { requireRole } from '../lib/middleware/auth';
import { hasAnyRole, isValidRole, UserRole } from '../lib/middleware/roles';

describe('Property 2: Role Authorization Consistency', () => {
  const allRoles = Object.values(UserRole);

  test('ADMIN role should always have access to any endpoint', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allRoles),
        (requiredRole) => {
          // ADMIN should always pass
          return requireRole('ADMIN', [requiredRole]);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('User with exact required role should always have access', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allRoles),
        (role) => {
          // User with exact role should pass
          return requireRole(role, [role]);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('User without required role should be denied (except ADMIN)', () => {
    const result = requireRole('BUYER', ['ORGANIZER']);
    expect(result).toBe(false);

    const result2 = requireRole('PROMOTER', ['INSPECTOR']);
    expect(result2).toBe(false);
  });

  test('hasAnyRole should work correctly for multiple allowed roles', () => {
    expect(hasAnyRole('BUYER', ['BUYER', 'ORGANIZER'])).toBe(true);
    expect(hasAnyRole('ORGANIZER', ['BUYER', 'ORGANIZER'])).toBe(true);
    expect(hasAnyRole('PROMOTER', ['BUYER', 'ORGANIZER'])).toBe(false);
    expect(hasAnyRole('ADMIN', ['BUYER'])).toBe(true); // ADMIN always passes
  });

  test('All role enums should be valid', () => {
    allRoles.forEach(role => {
      expect(isValidRole(role)).toBe(true);
    });
  });

  test('Invalid roles should be rejected', () => {
    expect(isValidRole('INVALID_ROLE')).toBe(false);
    expect(isValidRole('SUPER_USER')).toBe(false);
    expect(isValidRole('')).toBe(false);
  });

  test('Role authorization should be deterministic', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allRoles),
        fc.constantFrom(...allRoles),
        (userRole, requiredRole) => {
          const result1 = requireRole(userRole, [requiredRole]);
          const result2 = requireRole(userRole, [requiredRole]);
          // Same inputs should always produce same output
          return result1 === result2;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Empty allowed roles should deny all except ADMIN', () => {
    expect(requireRole('BUYER', [])).toBe(false);
    expect(requireRole('ORGANIZER', [])).toBe(false);
    expect(requireRole('ADMIN', [])).toBe(true); // ADMIN always passes
  });
});
