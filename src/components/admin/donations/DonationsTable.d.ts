
import { RefetchOptions } from '@tanstack/react-query';

export interface DonationsTableProps {
  donations: any[];
  isLoading: boolean;
  onViewDetails: (donation: any) => void;
  onRefresh: (options?: RefetchOptions) => Promise<void>;
  isLocked?: boolean;
}
