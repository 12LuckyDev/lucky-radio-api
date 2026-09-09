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
  ParseIntPipe,
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
    return await this.stationsService.getStations();
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
    return this.stationsService.getCurrentStationInfo();
  }

  @Get(':index')
  @ApiOperation({
    summary: 'Play station by index',
  })
  @ApiParam({
    name: 'index',
    type: Number,
    example: 0,
    description: 'Station index',
  })
  @ApiResponse({
    status: 200,
    description: 'Station playback started',
  })
  async playByIndex(
    @Param('index', new ParseIntPipe()) index: number,
  ): Promise<void> {
    await this.stationsService.playStationByIndex(index);
  }

  @Post('play-next/:id')
  @ApiOperation({
    summary: 'Play next station',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Current station ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Next station playback started',
  })
  async playNext(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.stationsService.playNextStation(id);
  }

  @Post('play-prev/:id')
  @ApiOperation({
    summary: 'Play previous station',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Current station ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Previous station playback started',
  })
  async playPrev(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.stationsService.playPrevStation(id);
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
    await this.stationsService.playStationById(id);
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
    return this.stationsService.createStation(station);
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
    return this.stationsService.updateStation(id, station);
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
    await this.stationsService.deleteStation(id);
  }
}
