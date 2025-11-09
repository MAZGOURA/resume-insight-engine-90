import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getContactMessages,
  updateContactMessage,
  deleteContactMessage,
} from "@/lib/database";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Mail,
  User,
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type ContactMessage = Tables<"contact_messages">;

const ContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getContactMessages();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateContactMessage(id, { is_read: true });
      setMessages(
        messages.map((msg) => (msg.id === id ? { ...msg, is_read: true } : msg))
      );
      toast.success("Message marked as read");
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast.error("Failed to mark message as read");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteContactMessage(id);
      setMessages(messages.filter((msg) => msg.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      toast.success("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: fr });
  };

  const getStatusBadge = (isRead: boolean | null) => {
    if (isRead) {
      return (
        <Badge variant="secondary">
          <CheckCircle className="w-3 h-3 mr-1" /> Lu
        </Badge>
      );
    }
    return (
      <Badge variant="default">
        <Clock className="w-3 h-3 mr-1" /> Non lu
      </Badge>
    );
  };

  return (
    <AdminLayout
      title="Messages Contact"
      subtitle="Gérez les messages de contact des clients"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Messages ({messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center">Chargement...</div>
              ) : messages.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Aucun message de contact
                </div>
              ) : (
                <div className="divide-y">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedMessage?.id === message.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">
                              {message.name}
                            </h3>
                            {getStatusBadge(message.is_read)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {message.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {message.email}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(message.created_at)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMessage(message.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {selectedMessage.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedMessage.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!selectedMessage.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Marquer comme lu
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <p className="mt-1">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date
                    </label>
                    <p className="mt-1">
                      {formatDate(selectedMessage.created_at)}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Sujet
                    </label>
                    <p className="mt-1 font-medium">
                      {selectedMessage.subject}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Message</label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {selectedMessage.response && (
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Réponse déjà envoyée
                    </label>
                    <div className="mt-2 p-4 bg-primary/10 rounded-lg">
                      <p className="whitespace-pre-wrap">
                        {selectedMessage.response}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Répondu le {formatDate(selectedMessage.responded_at)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Sélectionnez un message
                </h3>
                <p className="text-muted-foreground">
                  Choisissez un message de contact dans la liste pour le
                  consulter
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContactMessages;
