import { Inject } from '@nestjs/common';
import { PERMISSIONS_TOKEN } from './types';

/**
 * Inject the Permissions instance, in case you need it - see [detailed example](/additional-documentation/reference-&-detailed-example.html)
 */
export const InjectPermissions = () => Inject(PERMISSIONS_TOKEN);
