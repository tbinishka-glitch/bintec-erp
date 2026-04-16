/**
 * Re-export barrel — Entity Registry server actions
 * Allows EntityRegistryClient (in /components/admin) to import from './actions'
 * without bundling the full server action file path everywhere.
 */
export {
  createEntity,
  updateEntity,
  toggleEntityStatus,
  checkEntityDuplicates,
  flagEntityDuplicate,
  getEntityAuditLogs,
  exportEntitiesCSV,
  moveToTrash
} from '@/app/admin/users/actions'
