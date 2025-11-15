const request = require('supertest');
const app = require('../server');

// Set test environment
process.env.NODE_ENV = 'test';

describe('Recipe API Tests', () => {
  describe('GET /api/recipes', () => {
    test('should return all recipes (empty or populated)', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Database can be empty initially, so just check it's an array
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });

    test('should return recipes with correct structure', async () => {
      // First, ensure we have at least one recipe
      const newRecipe = {
        name: 'Structure Test Recipe',
        ingredients: 'Test ingredient',
        instructions: 'Test instructions',
        cookTime: '15 minutes'
      };

      await request(app)
        .post('/api/recipes')
        .send(newRecipe)
        .expect(201);

      const response = await request(app)
        .get('/api/recipes')
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      const recipe = response.body[0];
      expect(recipe).toHaveProperty('id');
      expect(recipe).toHaveProperty('name');
      expect(recipe).toHaveProperty('ingredients');
      expect(recipe).toHaveProperty('instructions');
      expect(recipe).toHaveProperty('cookTime');
    });
  });

  describe('POST /api/recipes', () => {
    test('should create a new recipe', async () => {
      const newRecipe = {
        name: 'Test Recipe',
        ingredients: 'Test ingredient 1\nTest ingredient 2',
        instructions: 'Test instructions',
        cookTime: '30 minutes'
      };

      const response = await request(app)
        .post('/api/recipes')
        .send(newRecipe)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newRecipe.name);
      expect(response.body.ingredients).toBe(newRecipe.ingredients);
      expect(response.body.instructions).toBe(newRecipe.instructions);
      expect(response.body.cookTime).toBe(newRecipe.cookTime);
    });

    test('should return 400 for invalid recipe data', async () => {
      const invalidRecipe = {
        name: '', // Empty name should fail
        ingredients: '',
        instructions: '',
        cookTime: '' 
      };

      const response = await request(app)
        .post('/api/recipes')
        .send(invalidRecipe)
        .expect(400);
        
      expect(response.body).toHaveProperty('error', 'All fields are required');
    });
  });

  describe('GET /api/recipes/:id', () => {
    test('should return a specific recipe', async () => {
      // First create a recipe to ensure we have one to fetch
      const newRecipe = {
        name: 'Specific Recipe Test',
        ingredients: 'Test ingredient',
        instructions: 'Test instructions',
        cookTime: '25 minutes'
      };

      const createResponse = await request(app)
        .post('/api/recipes')
        .send(newRecipe)
        .expect(201);

      const recipeId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/recipes/${recipeId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', recipeId);
      expect(response.body).toHaveProperty('name', newRecipe.name);
    });

    test('should return 404 for non-existent recipe', async () => {
      const response = await request(app)
        .get('/api/recipes/999')
        .expect(404);
        
      expect(response.body).toHaveProperty('error', 'Recipe not found');
    });
  });

  describe('DELETE /api/recipes/:id', () => {
    test('should delete an existing recipe', async () => {
      // First create a recipe to delete
      const newRecipe = {
        name: 'Recipe to Delete',
        ingredients: 'Ingredient 1',
        instructions: 'Instructions',
        cookTime: '20 minutes'
      };

      const createResponse = await request(app)
        .post('/api/recipes')
        .send(newRecipe)
        .expect(201);

      const recipeId = createResponse.body.id;

      // Then delete it
      const deleteResponse = await request(app)
        .delete(`/api/recipes/${recipeId}`)
        .expect(200);

      expect(deleteResponse.body).toHaveProperty('message', 'Recipe deleted successfully');

      // Verify it's deleted
      await request(app)
        .get(`/api/recipes/${recipeId}`)
        .expect(404);
    });

    test('should return 404 for deleting non-existent recipe', async () => {
      const response = await request(app)
        .delete('/api/recipes/999')
        .expect(404);
        
      expect(response.body).toHaveProperty('error', 'Recipe not found');
    });
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});