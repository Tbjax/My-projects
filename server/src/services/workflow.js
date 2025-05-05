/**
 * Workflow Service
 * 
 * Handles the business logic for managing workflows across the platform.
 */

const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Create a new workflow
 * @param {Object} workflowData - The workflow data to create
 * @returns {Promise<Object>} The created workflow
 */
exports.createWorkflow = async (workflowData) => {
  try {
    const { name, description, module, steps } = workflowData;

    // Insert the workflow
    const result = await db.query(
      `INSERT INTO core.workflows (
        name, 
        description, 
        module, 
        steps,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [name, description, module, JSON.stringify(steps)]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Error creating workflow', { error: error.message });
    throw error;
  }
};

/**
 * Update an existing workflow
 * @param {number} workflowId - The ID of the workflow to update
 * @param {Object} workflowData - The updated workflow data
 * @returns {Promise<Object>} The updated workflow
 */
exports.updateWorkflow = async (workflowId, workflowData) => {
  try {
    const { name, description, module, steps } = workflowData;

    // Update the workflow
    const result = await db.query(
      `UPDATE core.workflows
       SET name = $1, 
           description = $2,
           module = $3,
           steps = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, description, module, JSON.stringify(steps), workflowId]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Error updating workflow', { error: error.message });
    throw error;
  }
};

/**
 * Get a workflow by ID
 * @param {number} workflowId - The ID of the workflow to retrieve
 * @returns {Promise<Object>} The workflow
 */
exports.getWorkflowById = async (workflowId) => {
  try {
    const result = await db.query(
      'SELECT * FROM core.workflows WHERE id = $1',
      [workflowId]
    );

    if (result.rows.length === 0) {
      throw new Error('Workflow not found');
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Error getting workflow', { error: error.message });
    throw error;
  }
};

/**
 * Get all workflows for a specific module
 * @param {string} module - The module to get workflows for
 * @returns {Promise<Array<Object>>} The list of workflows
 */
exports.getWorkflowsByModule = async (module) => {
  try {
    const result = await db.query(
      'SELECT * FROM core.workflows WHERE module = $1',
      [module]
    );

    return result.rows;
  } catch (error) {
    logger.error('Error getting workflows', { error: error.message });
    throw error;
  }
};

/**
 * Delete a workflow by ID
 * @param {number} workflowId - The ID of the workflow to delete
 * @returns {Promise<void>}
 */
exports.deleteWorkflow = async (workflowId) => {
  try {
    await db.query(
      'DELETE FROM core.workflows WHERE id = $1',
      [workflowId]
    );
  } catch (error) {
    logger.error('Error deleting workflow', { error: error.message });
    throw error;
  }
};

/**
 * Get the current state of a workflow instance
 * @param {number} workflowInstanceId - The ID of the workflow instance
 * @returns {Promise<Object>} The current state of the workflow instance
 */
exports.getWorkflowInstanceState = async (workflowInstanceId) => {
  try {
    const result = await db.query(
      `SELECT 
        wi.id,
        wi.workflow_id,
        wi.current_step,
        wi.status,
        wi.created_at,
        wi.updated_at
      FROM core.workflow_instances wi
      WHERE wi.id = $1`,
      [workflowInstanceId]
    );

    if (result.rows.length === 0) {
      throw new Error('Workflow instance not found');
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Error getting workflow instance state', { error: error.message });
    throw error;
  }
};

/**
 * Create a new workflow instance
 * @param {number} workflowId - The ID of the workflow to create an instance for
 * @param {Object} initialData - The initial data for the workflow instance
 * @returns {Promise<Object>} The created workflow instance
 */
exports.createWorkflowInstance = async (workflowId, initialData) => {
  try {
    const result = await db.query(
      `INSERT INTO core.workflow_instances (
        workflow_id,
        current_step,
        status,
        data,
        created_at,
        updated_at
      ) VALUES ($1, 0, 'active', $2, NOW(), NOW()) RETURNING *`,
      [workflowId, JSON.stringify(initialData)]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Error creating workflow instance', { error: error.message });
    throw error;
  }
};

/**
 * Advance a workflow instance to the next step
 * @param {number} workflowInstanceId - The ID of the workflow instance to advance
 * @param {Object} stepData - The data for the current step
 * @returns {Promise<Object>} The updated workflow instance
 */
exports.advanceWorkflowInstance = async (workflowInstanceId, stepData) => {
  try {
    const result = await db.query(
      `UPDATE core.workflow_instances
       SET current_step = current_step + 1,
           data = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(stepData), workflowInstanceId]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Error advancing workflow instance', { error: error.message });
    throw error;
  }
};

/**
 * Complete a workflow instance
 * @param {number} workflowInstanceId - The ID of the workflow instance to complete
 * @param {Object} finalData - The final data for the workflow instance
 * @returns {Promise<Object>} The completed workflow instance
 */
exports.completeWorkflowInstance = async (workflowInstanceId, finalData) => {
  try {
    const result = await db.query(
      `UPDATE core.workflow_instances
       SET status = 'completed',
           data = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(finalData), workflowInstanceId]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Error completing workflow instance', { error: error.message });
    throw error;
  }
};
