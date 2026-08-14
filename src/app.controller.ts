import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({
    summary: 'Get API welcome message',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the API welcome message',
    schema: {
      type: 'string',
      example: 'Hello from lucky-radio-api',
    },
  })
  getHello(): string {
    return 'Hello from lucky-radio-api';
  }

  @Get('health')
  @ApiOperation({
    summary: 'Check API health',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the API health status',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  getHealth(): { status: boolean } {
    return { status: true };
  }
}
