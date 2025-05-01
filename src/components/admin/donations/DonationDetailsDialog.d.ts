
import { Dispatch, SetStateAction } from 'react';

export interface DonationDetailsDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  donation: any;
  isLocked: boolean;
}
