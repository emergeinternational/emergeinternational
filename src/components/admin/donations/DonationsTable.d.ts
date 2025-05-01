
export interface DonationsTableProps {
  donations: any[];
  isLoading: boolean;
  onViewDetails: (donation: any) => void;
  onRefresh: () => void;
  isLocked?: boolean;
}
