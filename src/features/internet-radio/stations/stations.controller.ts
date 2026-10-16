import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UsePipes,
  Patch,
  ParseUUIDPipe,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StationsService } from './stations.service';
import { StationDTO, stationDTOSchema } from './dto/station.dto';
import {
  CurrentStationInfoDTO,
  currentStationInfoDTOSchema,
} from './dto/current-station.dto';
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe';
import {
  createStationDTOSchema,
  createStationSchema,
  updateStationDTOSchema,
  updateStationSchema,
} from './dto/station-schemas.dto';
import type {
  CreateStationDTO,
  UpdateStationDTO,
} from './dto/station-schemas.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CommandResultMapper } from 'src/features/shared';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all stations',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all stations',
    schema: {
      type: 'array',
      items: stationDTOSchema,
    },
  })
  async getStations(): Promise<StationDTO[]> {
    const result = await this.stationsService.getStations();
    return CommandResultMapper.map(result);
  }

  @Get('current')
  @ApiOperation({
    summary: 'Get current station information',
  })
  @ApiResponse({
    status: 200,
    description: 'Current station and navigation information',
    schema: currentStationInfoDTOSchema,
  })
  async getCurrentStations(): Promise<CurrentStationInfoDTO> {
    const result = await this.stationsService.getCurrentStationInfo();
    return CommandResultMapper.map(result);
  }

  @Post('play-next')
  @ApiOperation({
    summary: 'Play next station',
  })
  @ApiResponse({
    status: 200,
    description: 'Next station playback started',
  })
  async playNext(): Promise<void> {
    const result = await this.stationsService.playNextStation();
    CommandResultMapper.map(result);
  }

  @Post('play-prev')
  @ApiOperation({
    summary: 'Play previous station',
  })
  @ApiResponse({
    status: 200,
    description: 'Previous station playback started',
  })
  async playPrev(): Promise<void> {
    const result = await this.stationsService.playPrevStation();
    CommandResultMapper.map(result);
  }

  @Post('play/:id')
  @ApiOperation({
    summary: 'Play station by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Station ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Station playback started',
  })
  async playById(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    const result = await this.stationsService.playStationById(id);
    CommandResultMapper.map(result);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a station',
  })
  @ApiBody({
    description: 'Station data',
    schema: createStationDTOSchema,
  })
  @ApiResponse({
    status: 201,
    description: 'Station created successfully',
    schema: stationDTOSchema,
  })
  @UsePipes(new ZodValidationPipe(createStationSchema))
  async createStation(@Body() station: CreateStationDTO): Promise<StationDTO> {
    const result = await this.stationsService.createStation(station);
    return CommandResultMapper.map(result);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a station',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Station ID',
  })
  @ApiBody({
    description: 'Station fields to update',
    schema: updateStationDTOSchema,
  })
  @ApiResponse({
    status: 200,
    description: 'Station updated successfully',
    schema: stationDTOSchema,
  })
  async updateStation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(updateStationSchema)) station: UpdateStationDTO,
  ): Promise<StationDTO> {
    const result = await this.stationsService.updateStation(id, station);
    return CommandResultMapper.map(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a station',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Station ID',
  })
  @ApiResponse({
    status: 204,
    description: 'Station deleted successfully',
  })
  async deleteStation(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    const result = await this.stationsService.deleteStation(id);
    CommandResultMapper.map(result);
  }
}
