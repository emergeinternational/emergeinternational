
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Event } from '@/hooks/useEvents';

interface DiscountCode {
  id: string;
  code: string;
  event_id: string;
  discount_percent?: number;
  discount_amount?: number;
  valid_from: string;
  valid_until?: string;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormValues {
  code: string;
  event_id: string;
  discount_type: 'percent' | 'amount';
  discount_value: number;
  valid_until?: string;
  max_uses?: number;
  is_active: boolean;
}

const fetchDiscountCodes = async (): Promise<DiscountCode[]> => {
  const { data, error } = await supabase
    .from('discount_codes')
    .select(`
      *,
      events (name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

const fetchEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

const createDiscountCode = async (values: FormValues): Promise<DiscountCode> => {
  const payload: any = {
    code: values.code,
    event_id: values.event_id,
    valid_from: new Date().toISOString(),
    is_active: values.is_active
  };

  if (values.discount_type === 'percent') {
    payload.discount_percent = values.discount_value;
  } else {
    payload.discount_amount = values.discount_value;
  }

  if (values.valid_until) {
    payload.valid_until = values.valid_until;
  }

  if (values.max_uses) {
    payload.max_uses = values.max_uses;
  }

  const { data, error } = await supabase
    .from('discount_codes')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateDiscountCode = async (id: string, values: FormValues): Promise<DiscountCode> => {
  const payload: any = {
    code: values.code,
    event_id: values.event_id,
    is_active: values.is_active,
    updated_at: new Date().toISOString()
  };

  if (values.discount_type === 'percent') {
    payload.discount_percent = values.discount_value;
    payload.discount_amount = null;
  } else {
    payload.discount_amount = values.discount_value;
    payload.discount_percent = null;
  }

  if (values.valid_until) {
    payload.valid_until = values.valid_until;
  }

  if (values.max_uses) {
    payload.max_uses = values.max_uses;
  }

  const { data, error } = await supabase
    .from('discount_codes')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteDiscountCode = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('discount_codes')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const DiscountCodeManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      code: '',
      event_id: '',
      discount_type: 'percent',
      discount_value: 10,
      is_active: true
    }
  });

  const discountType = watch('discount_type');

  const { data: discountCodes, isLoading: isLoadingCodes } = useQuery({
    queryKey: ['discount-codes'],
    queryFn: fetchDiscountCodes,
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  const createMutation = useMutation({
    mutationFn: createDiscountCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast({ title: "Success", description: "Discount code created successfully!" });
      setIsCreateDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to create discount code: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string, values: FormValues }) => 
      updateDiscountCode(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast({ title: "Success", description: "Discount code updated successfully!" });
      setIsEditDialogOpen(false);
      setSelectedCode(null);
      reset();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to update discount code: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDiscountCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast({ title: "Success", description: "Discount code deleted successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to delete discount code: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const handleCreate = (data: FormValues) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: FormValues) => {
    if (selectedCode) {
      updateMutation.mutate({ id: selectedCode.id, values: data });
    }
  };

  const openEditDialog = (code: DiscountCode) => {
    setSelectedCode(code);
    setValue('code', code.code);
    setValue('event_id', code.event_id);
    setValue('discount_type', code.discount_percent ? 'percent' : 'amount');
    setValue('discount_value', code.discount_percent || code.discount_amount || 0);
    setValue('valid_until', code.valid_until ? new Date(code.valid_until).toISOString().split('T')[0] : '');
    setValue('max_uses', code.max_uses || undefined);
    setValue('is_active', code.is_active);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this discount code?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoadingCodes || isLoadingEvents) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Discount Codes</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Discount Code</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Discount Code</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
                <div>
                  <Label htmlFor="code">Code*</Label>
                  <Input id="code" {...register('code', { required: true })} placeholder="SUMMER20" />
                </div>
                
                <div>
                  <Label htmlFor="event_id">Event*</Label>
                  <Select 
                    onValueChange={(value) => setValue('event_id', value)} 
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events?.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="discount_type">Discount Type*</Label>
                  <Select 
                    onValueChange={(value) => setValue('discount_type', value as 'percent' | 'amount')} 
                    defaultValue="percent"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="discount_value">
                    {discountType === 'percent' ? 'Percentage Value*' : 'Amount*'}
                  </Label>
                  <div className="flex items-center">
                    <Input 
                      id="discount_value" 
                      type="number" 
                      {...register('discount_value', { 
                        required: true,
                        min: 0,
                        max: discountType === 'percent' ? 100 : undefined 
                      })} 
                    />
                    <span className="ml-2">{discountType === 'percent' ? '%' : 'ETB'}</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="valid_until">Valid Until</Label>
                  <div className="relative">
                    <Input 
                      id="valid_until" 
                      type="date" 
                      {...register('valid_until')} 
                      min={new Date().toISOString().split('T')[0]} 
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="max_uses">Maximum Uses</Label>
                  <Input 
                    id="max_uses" 
                    type="number" 
                    {...register('max_uses', { min: 1 })} 
                    placeholder="Unlimited if empty" 
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Code'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {discountCodes && discountCodes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discountCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.code}</TableCell>
                    <TableCell>{(code as any).events?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {code.discount_percent 
                        ? `${code.discount_percent}%` 
                        : `ETB ${code.discount_amount?.toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      {code.current_uses} 
                      {code.max_uses ? `/${code.max_uses}` : ''}
                    </TableCell>
                    <TableCell>
                      {code.valid_until 
                        ? new Date(code.valid_until).toLocaleDateString() 
                        : 'No expiry'
                      }
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        code.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditDialog(code)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(code.id)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No discount codes found. Create your first code by clicking the button above.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Discount Code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
            <div>
              <Label htmlFor="edit_code">Code*</Label>
              <Input id="edit_code" {...register('code', { required: true })} />
            </div>
            
            <div>
              <Label htmlFor="edit_event_id">Event*</Label>
              <Select 
                onValueChange={(value) => setValue('event_id', value)} 
                defaultValue={selectedCode?.event_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events?.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit_discount_type">Discount Type*</Label>
              <Select 
                onValueChange={(value) => setValue('discount_type', value as 'percent' | 'amount')} 
                defaultValue={selectedCode?.discount_percent ? 'percent' : 'amount'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage (%)</SelectItem>
                  <SelectItem value="amount">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit_discount_value">
                {discountType === 'percent' ? 'Percentage Value*' : 'Amount*'}
              </Label>
              <div className="flex items-center">
                <Input 
                  id="edit_discount_value" 
                  type="number" 
                  {...register('discount_value', { 
                    required: true,
                    min: 0,
                    max: discountType === 'percent' ? 100 : undefined 
                  })} 
                />
                <span className="ml-2">{discountType === 'percent' ? '%' : 'ETB'}</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_valid_until">Valid Until</Label>
              <div className="relative">
                <Input 
                  id="edit_valid_until" 
                  type="date" 
                  {...register('valid_until')} 
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_max_uses">Maximum Uses</Label>
              <Input 
                id="edit_max_uses" 
                type="number" 
                {...register('max_uses', { min: 1 })} 
                placeholder="Unlimited if empty" 
              />
            </div>
            
            <div>
              <Label htmlFor="edit_is_active">Status</Label>
              <Select 
                onValueChange={(value) => setValue('is_active', value === 'active')} 
                defaultValue={selectedCode?.is_active ? 'active' : 'inactive'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiscountCodeManager;
