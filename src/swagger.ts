export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'BacktestPro API',
    version: '1.0.0',
    description: 'REST API for importing datasets and running backtests.',
  },
  servers: [{ url: '/api', description: 'Local dev' }],
  components: {
    schemas: {
      Dataset: {
        type: 'object',
        properties: {
          id:                { type: 'integer', example: 1 },
          name:              { type: 'string',  example: 'AAPL 2023' },
          original_filename: { type: 'string',  example: 'aapl_2023.csv' },
          row_count:         { type: 'integer', example: 252 },
          created_at:        { type: 'string',  format: 'date-time' },
        },
      },
      BacktestRun: {
        type: 'object',
        properties: {
          id:                    { type: 'integer', example: 1 },
          dataset_id:            { type: 'integer', example: 1 },
          strategy_name:         { type: 'string',  example: 'momentum' },
          status:                { type: 'string',  enum: ['pending', 'running', 'completed', 'failed'] },
          initial_capital:       { type: 'number',  example: 10000 },
          position_size:         { type: 'number',  example: 0.1 },
          start_date:            { type: 'integer', nullable: true, description: 'Unix ms of first candle' },
          end_date:              { type: 'integer', nullable: true, description: 'Unix ms of last candle' },
          final_cash:            { type: 'number',  nullable: true },
          final_portfolio_value: { type: 'number',  nullable: true },
          total_return_pct:      { type: 'number',  nullable: true, example: 12.5 },
          created_at:            { type: 'string',  format: 'date-time' },
          completed_at:          { type: 'string',  format: 'date-time', nullable: true },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
      GenericError: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/datasets/import': {
      post: {
        summary: 'Import a dataset from a CSV file',
        tags: ['Datasets'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary', description: 'CSV file with OHLCV candle data' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Dataset imported successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dataset:     { $ref: '#/components/schemas/Dataset' },
                    validRows:   { type: 'integer', example: 250 },
                    totalRows:   { type: 'integer', example: 252 },
                    skippedRows: { type: 'integer', example: 2 },
                    errors:      { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          '400': {
            description: 'No file uploaded',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GenericError' } } },
          },
        },
      },
    },
    '/datasets': {
      get: {
        summary: 'List all datasets',
        tags: ['Datasets'],
        responses: {
          '200': {
            description: 'Array of datasets',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Dataset' } },
              },
            },
          },
        },
      },
    },
    '/backtests': {
      post: {
        summary: 'Run a new backtest',
        tags: ['Backtests'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['datasetId', 'strategy', 'initialCapital', 'positionSize'],
                properties: {
                  datasetId:      { type: 'integer', example: 1, description: 'ID of an imported dataset' },
                  strategy:       { type: 'string',  enum: ['momentum'], example: 'momentum' },
                  initialCapital: { type: 'number',  example: 10000, description: 'Starting cash (must be > 0)' },
                  positionSize:   { type: 'number',  example: 0.1,   description: 'Fraction of cash per trade (0–1]' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Backtest completed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/BacktestRun' } } },
          },
          '400': {
            description: 'Validation errors',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } },
          },
        },
      },
      get: {
        summary: 'List all backtest runs',
        tags: ['Backtests'],
        responses: {
          '200': {
            description: 'Array of backtest runs',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/BacktestRun' } },
              },
            },
          },
        },
      },
    },
    '/backtests/{id}': {
      get: {
        summary: 'Get a backtest run by ID',
        tags: ['Backtests'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', example: 1 },
          },
        ],
        responses: {
          '200': {
            description: 'Backtest run',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/BacktestRun' } } },
          },
          '400': {
            description: 'Invalid ID',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GenericError' } } },
          },
          '404': {
            description: 'Not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GenericError' } } },
          },
        },
      },
    },
  },
};

export const swaggerUiOptions = {
  customSiteTitle: 'BacktestPro API Docs',
};
