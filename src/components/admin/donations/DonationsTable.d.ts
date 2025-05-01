
import { Dispatch, SetStateAction } from 'react';

export interface DonationsTableProps {
  donations: any[];
  isLoading: boolean;
  onViewDetails: (donation: any) => void;
  onRefresh: () => Promise<void>;
  isLocked: boolean;
}
