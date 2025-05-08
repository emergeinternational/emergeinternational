
export interface DonationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: any;
  isLocked?: boolean;
}
