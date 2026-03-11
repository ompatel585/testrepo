import { SetMetadata } from '@nestjs/common';

export const USER_FIREWALL_KEY = 'userFirewall';
export const UserFirewall = () => SetMetadata(USER_FIREWALL_KEY, true);
