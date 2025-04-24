import { useEffect, useState } from "react";
import { AlertTriangle, Calendar, Heart, Settings, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import AdminLayout from "../../layouts/AdminLayout";
import StatsCard from "../../components/admin/StatsCard";
import PaymentsTable from "../../components/admin/PaymentsTable";
import EventsSection from "../../components/admin/EventsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Link } from "react-router-dom";

interface Payment {
  id: string;
  name: string;
  city: string;
  status: string;
}

interface Event {
  id: number;
  name: string;
  date: string;
  registrations: number;
}

const Dashboard = () => {
  const { user, userRole, hasRole } = useAuth();
  const { toast } = useToast();
  
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      return [
        { label: "Total Users", value: "1,245", change: "+12%" },
        { label: "Active Subscriptions", value: "348", change: "+5%" },
        { label: "Monthly Donations", value: "ETB 45,600", change: "+18%" },
        { label: "Products Sold", value: "89", change: "+7%" },
      ];
    }
  });

  const { data: userCount, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'user-count'],
    queryFn: async () => {
      try {
        return { count: 26 };
      } catch (error) {
        console.error('Error fetching user count:', error);
        return { count: 0 };
      }
    }
  });

  const { data: payments, isLoading: paymentsLoading, refetch: refetchPayments } = useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: async () => {
      return [
        { id: "10472", name: "Abeba K.", city: "Addis Ababa", status: "pending" },
        { id: "10463", name: "Kifle M.", city: "Dire Dawa", status: "pending" },
      ] as Payment[];
    }
  });

  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: async () => {
      return [
        { id: 1, name: "Emerge Addis Fashion Show", date: "June 12, 2025", registrations: 45 },
        { id: 2, name: "Designer Workshop", date: "July 8, 2025", registrations: 23 },
      ] as Event[];
    }
  });

  const handleActivatePayment = async (id: string) => {
    try {
      toast({
        title: "Payment Activated",
        description: `Payment ${id} has been activated successfully.`
      });
      await refetchPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const eventFormSchema = z.object({
    name: z.string().min(3, "Event name must be at least 3 characters"),
    date: z.string().min(3, "Please provide a valid date"),
  });

  const eventForm = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      date: "",
    },
  });

  const handleAddEvent = async (values: z.infer<typeof eventFormSchema>) => {
    try {
      toast({
        title: "Event Added",
        description: `${values.name} has been added successfully.`
      });
      eventForm.reset();
      await refetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Logged in as: {user?.email} ({userRole})
            </span>
            <Link to="/admin/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {hasRole('admin') && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2 text-emerge-gold" />
                  User Management
                </CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-2xl">{usersLoading ? "..." : userCount?.count}</p>
                    <p className="text-sm text-muted-foreground">Registered users</p>
                  </div>
                  <Link to="/admin/users">
                    <Button>Manage Users</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-emerge-gold" />
                Events
              </CardTitle>
              <CardDescription>Scheduled workshops and fashion events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-2xl">{eventsLoading ? "..." : events?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Upcoming events</p>
                </div>
                <Link to="/admin/events">
                  <Button>Manage Events</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Heart className="h-5 w-5 mr-2 text-emerge-gold" />
                Donations
              </CardTitle>
              <CardDescription>Track donation campaigns and contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-2xl">ETB 45,600</p>
                  <p className="text-sm text-muted-foreground">Monthly donations</p>
                </div>
                <Link to="/admin/donations">
                  <Button>View Details</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-lg shadow-sm animate-pulse h-24"></div>
            ))
          ) : (
            statsData?.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">CBEBirr Payments</h2>
          
          <div className="bg-emerge-cream p-4 rounded mb-5 flex items-start">
            <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0 mt-1" size={20} />
            <p>Review recent payment uploads</p>
          </div>
          
          <div className="bg-white rounded shadow overflow-hidden">
            {paymentsLoading ? (
              <div className="p-8 text-center">Loading payments...</div>
            ) : payments && payments.length > 0 ? (
              <PaymentsTable 
                payments={payments}
                onActivate={handleActivatePayment}
              />
            ) : (
              <div className="p-8 text-center">No pending payments found</div>
            )}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Events</h2>
          
          <Dialog>
            <DialogTrigger asChild>
              <div className="bg-emerge-cream p-4 rounded mb-5">
                <div className="flex justify-between items-center">
                  <button className="flex items-center text-emerge-gold">
                    <span>ADD NEW EVENT</span>
                  </button>
                  <button className="bg-emerge-gold px-6 py-1 text-black rounded">
                    MANAGE
                  </button>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <Form {...eventForm}>
                <form onSubmit={eventForm.handleSubmit(handleAddEvent)} className="space-y-4">
                  <FormField
                    control={eventForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={eventForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Date</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. June 12, 2025" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">Add Event</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {eventsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array(2).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-5 rounded shadow animate-pulse h-32"></div>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <EventsSection events={events} />
          ) : (
            <div className="bg-white p-8 text-center rounded shadow">
              No events found. Add your first event.
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-white p-5 rounded shadow">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-emerge-gold mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">New user registration</p>
                  <p className="text-gray-500 text-sm">Today, 10:45 AM</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-emerge-gold mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">5 new orders received</p>
                  <p className="text-gray-500 text-sm">Yesterday, 4:30 PM</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-emerge-gold mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">Payment confirmed for Workshop</p>
                  <p className="text-gray-500 text-sm">Yesterday, 2:15 PM</p>
                </div>
              </div>
            </div>
            
            <a href="/admin/activity" className="block text-emerge-gold mt-4 text-sm">
              View all activity
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
