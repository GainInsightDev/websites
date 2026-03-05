/**
 * Selector Contract Template
 *
 * This template defines the structure for test selectors that bridge
 * design (Storybook) and testing (E2E/RTL). Selectors are referenced
 * in mini-PRD Section 5 and implemented in `/tests/selectors/`.
 *
 * Pattern: CAPABILITY.component.element
 * Example: AUTH.signup.email
 *
 * @see .claude/skills/af-bdd-expertise/SKILL.md for usage in scenarios
 */

// Example: Authentication selectors
export const AUTH = {
  signup: {
    form: 'signup-form',
    email: 'signup-email',
    password: 'signup-password',
    confirmPassword: 'signup-confirm-password',
    submit: 'signup-submit',
    successMessage: 'signup-success',
    errorMessage: 'signup-error',
    passwordError: 'signup-password-error',
    emailError: 'signup-email-error',
  },
  login: {
    form: 'login-form',
    email: 'login-email',
    password: 'login-password',
    submit: 'login-submit',
    forgotPassword: 'login-forgot-password',
    errorMessage: 'login-error',
  },
  logout: {
    button: 'logout-button',
    confirmDialog: 'logout-confirm',
  },
};

// Template for new capabilities
export const CAPABILITY_TEMPLATE = {
  // Group by component/feature
  componentName: {
    // Elements use kebab-case with component prefix
    element: 'component-element',
    // Forms
    form: 'component-form',
    submit: 'component-submit',
    // Messages
    successMessage: 'component-success',
    errorMessage: 'component-error',
    // Fields
    fieldName: 'component-field-name',
    fieldError: 'component-field-error',
  },
};

/**
 * Usage in tests:
 *
 * // E2E (Playwright)
 * await page.getByTestId(AUTH.signup.email).fill('test@example.com');
 * await page.getByTestId(AUTH.signup.submit).click();
 * await expect(page.getByTestId(AUTH.signup.successMessage)).toBeVisible();
 *
 * // Component (RTL)
 * const emailInput = screen.getByTestId(AUTH.signup.email);
 * fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
 *
 * Usage in components:
 *
 * <input data-testid={AUTH.signup.email} ... />
 */

/**
 * Naming conventions:
 *
 * 1. CAPABILITY is SCREAMING_CASE (AUTH, CHECKOUT, DASHBOARD)
 * 2. Component groups are camelCase (signup, login, promo)
 * 3. Elements are camelCase (email, submit, errorMessage)
 * 4. data-testid values are kebab-case (signup-email)
 * 5. Use consistent suffixes: *Form, *Submit, *Error, *Success
 */
