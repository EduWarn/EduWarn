
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Phone, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { initiateWhatsAppChat } from '@/utils/contactHelpers';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Contact } from '@/types/database';
import { useAdminContacts } from '@/hooks/useAdminContacts';

const ContactsManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewContactData, setViewContactData] = useState<Contact | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: contacts = [], isLoading } = useAdminContacts();

  const handleViewContact = (contact: Contact) => {
    setViewContactData(contact);
    setIsViewDialogOpen(true);
  };

  const handleWhatsAppChat = (phone: string) => {
    initiateWhatsAppChat(phone);
  };

  const filteredContacts = contacts?.filter(
    (contact) =>
      contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contact Submissions</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No contacts found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.full_name}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell className="max-w-[200px] truncate">{contact.subject}</TableCell>
                <TableCell>{new Date(contact.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewContact(contact)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    {contact.whatsapp_opted_in && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-white hover:bg-green-600"
                        onClick={() => handleWhatsAppChat(contact.phone)}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* View Contact Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              Message received on {viewContactData && new Date(viewContactData.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {viewContactData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1">{viewContactData.full_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">
                    <a href={`mailto:${viewContactData.email}`} className="text-primary hover:underline">
                      {viewContactData.email}
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="mt-1">
                    <a href={`tel:${viewContactData.phone}`} className="hover:underline">
                      {viewContactData.phone}
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">WhatsApp Opt-In</h3>
                  <p className="mt-1">
                    {viewContactData.whatsapp_opted_in ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        No
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                <p className="mt-1">{viewContactData.subject}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Message</h3>
                <div className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {viewContactData.message}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                {viewContactData.whatsapp_opted_in && (
                  <Button
                    variant="outline"
                    onClick={() => handleWhatsAppChat(viewContactData.phone)}
                    className="text-green-600 hover:text-white hover:bg-green-600"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp Chat
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${viewContactData.email}`, '_blank')}
                >
                  Reply by Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsManager;
