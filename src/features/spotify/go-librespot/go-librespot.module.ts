import { Module } from '@nestjs/common';
import { GoLibrespotClient } from './go-librespot.client';
import { GoLibrespotWatcher } from './go-librespot.watcher';

@Module({ providers: [GoLibrespotClient, GoLibrespotWatcher] })
export class GoLibrespotModule {}
