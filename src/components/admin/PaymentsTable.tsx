
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Payment {
  id: string;
  name: string;
  city: string;
  status: string;
  // Additional fields that would be in a real implementation
  amount?: string;
  date?: string;
  receiptUrl?: string;
}

interface PaymentsTableProps {
  payments: Payment[];
  onActivate: (id: string) => void;
}

const PaymentsTable = ({ payments, onActivate }: PaymentsTableProps) => {
  const { hasRole } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  const canActivate = hasRole(['admin', 'editor']);

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>City</TableHead>
            <TableHead>REF ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                No payments found
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.name}</TableCell>
                <TableCell>{payment.city}</TableCell>
                <TableCell>{payment.id}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    payment.status === "pending" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {payment.status === "pending" ? "Pending" : "Active"}
                  </span>
                </TableCell>
                <TableCell className="space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewPayment(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-500">Name</p>
                            <p>{selectedPayment?.name}</p>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-500">City</p>
                            <p>{selectedPayment?.city}</p>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-500">Reference ID</p>
                            <p>{selectedPayment?.id}</p>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-500">Status</p>
                            <p>{selectedPayment?.status}</p>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-500">Amount</p>
                            <p>{selectedPayment?.amount || "ETB 1,500"}</p>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-500">Date</p>
                            <p>{selectedPayment?.date || "Apr 24, 2025"}</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 border-t pt-4">
                          <h4 className="font-medium mb-2">Payment Receipt</h4>
                          <div className="bg-gray-100 p-4 rounded text-center">
                            {selectedPayment?.receiptUrl ? (
                              <img 
                                src={selectedPayment.receiptUrl} 
                                alt="Payment receipt" 
                                className="max-h-60 mx-auto"
                              />
                            ) : (
                              <p className="text-gray-500">No receipt image available</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Close</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <button
                    onClick={() => onActivate(payment.id)}
                    className="bg-emerge-darkBg text-white px-4 py-1 text-sm rounded hover:bg-emerge-gold transition-colors"
                    disabled={!canActivate || payment.status !== "pending"}
                  >
                    ACTIVATE
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default PaymentsTable;
