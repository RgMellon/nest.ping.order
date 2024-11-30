import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientProxyPingMe } from './client-proxy';

@Module({
  imports: [ConfigModule],
  exports: [ClientProxyPingMe],
  providers: [ClientProxyPingMe],
})
export class ProxyrmqModule {}
