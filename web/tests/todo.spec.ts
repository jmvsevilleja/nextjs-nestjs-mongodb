import { test, expect } from '@playwright/test';

test.describe('Todo Functionality', () => {
  const todoTitle = `My Test Todo - ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    // Login before each test
    const email = process.env.TEST_USER_EMAIL || 'testuser@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'password123';

    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard');
    await expect(page.locator('h1:has-text("Your Tasks")')).toBeVisible();
  });

  test('should allow a user to create, update, and delete a todo', async ({ page }) => {
    // Create Todo
    await page.fill('input[placeholder="Enter task title"]', todoTitle);
    // Assuming the description input is identifiable like this. If not, this line can be removed or adjusted.
    await page.fill('textarea[placeholder="Enter task description"]', 'This is a test description.');
    await page.click('button:has-text("Add Task")');

    // Verify todo creation
    // It's better to locate the item more specifically if possible, e.g., within a list container
    const todoItemLocator = page.locator(`div:has-text("${todoTitle}")`).first(); // Use first() if multiple elements might match loosely
    await expect(todoItemLocator).toBeVisible();

    // Update Todo (Mark as Complete)
    // Assuming the checkbox is a direct child or sibling identifiable this way
    const checkboxLocator = todoItemLocator.locator('input[type="checkbox"]');
    await checkboxLocator.check();
    await expect(checkboxLocator).toBeChecked();

    // Verify completion status visually if possible (e.g., style change)
    // This depends on how completion is styled. Example:
    // await expect(todoItemLocator.locator('span.title-text')).toHaveClass(/line-through/);
    // For now, checking the checkbox state is the primary verification.

    // Delete Todo
    // Assuming the delete button is within the todo item and identifiable like this
    const deleteButtonLocator = todoItemLocator.locator('button:has-text("Delete")');
    await deleteButtonLocator.click();

    // Verify todo deletion
    await expect(todoItemLocator).not.toBeVisible();
  });
});
