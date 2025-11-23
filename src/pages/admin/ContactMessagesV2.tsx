import { useState, useEffect } from "react";
import { AdminLayoutV2 } from "@/components/admin/v2/AdminLayoutV2";
import { FilterBar } from "@/components/admin/v2/FilterBar";
import { DataTable } from "@/components/admin/v2/DataTable";
import { MessageDetailsModal } from "@/components/admin/v2/MessageDetailsModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ContactMessagesV2() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("messages_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des messages");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(!currentStatus ? "Message marqué comme lu" : "Message marqué comme non lu");
      fetchMessages();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filteredMessages = messages.filter(
    (message) =>
      message.name.toLowerCase().includes(search.toLowerCase()) ||
      message.email.toLowerCase().includes(search.toLowerCase()) ||
      message.subject.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Statut",
      accessor: (message: any) => (
        message.is_read ? (
          <Badge variant="secondary">Lu</Badge>
        ) : (
          <Badge variant="default">Non lu</Badge>
        )
      ),
    },
    {
      header: "De",
      accessor: (message: any) => (
        <div>
          <p className="font-medium">{message.name}</p>
          <p className="text-sm text-muted-foreground">{message.email}</p>
        </div>
      ),
    },
    {
      header: "Sujet",
      accessor: "subject" as const,
      cell: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      header: "Message",
      accessor: "message" as const,
      cell: (value: string) => (
        <p className="line-clamp-2 text-sm text-muted-foreground">{value}</p>
      ),
    },
    {
      header: "Date",
      accessor: "created_at" as const,
      cell: (value: string) =>
        format(new Date(value), "d MMM yyyy HH:mm", { locale: fr }),
    },
    {
      header: "Actions",
      accessor: (message: any) => (
        <Button
          variant={message.is_read ? "outline" : "default"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleMarkAsRead(message.id, message.is_read);
          }}
        >
          <Mail className="h-4 w-4 mr-2" />
          {message.is_read ? "Marquer non lu" : "Marquer lu"}
        </Button>
      ),
    },
  ];

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <AdminLayoutV2>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Messages de Contact</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 && (
              <span className="font-semibold text-primary">
                {unreadCount} message{unreadCount > 1 ? "s" : ""} non lu{unreadCount > 1 ? "s" : ""}
              </span>
            )}
            {unreadCount === 0 && "Tous les messages ont été lus"}
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher un message..."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={fetchMessages}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const csv = [
                  ['De', 'Email', 'Sujet', 'Message', 'Date', 'Lu'].join(','),
                  ...filteredMessages.map(m => [
                    m.name,
                    m.email,
                    m.subject,
                    m.message.replace(/,/g, ';'),
                    format(new Date(m.created_at), 'dd/MM/yyyy HH:mm'),
                    m.is_read ? 'Oui' : 'Non'
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `messages-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                toast.success("Export réussi");
              }}>
                Exporter
              </Button>
            </>
          }
        />

        {/* Messages Table */}
        <DataTable
          data={filteredMessages}
          columns={columns}
          loading={loading}
          emptyMessage="Aucun message trouvé"
          onRowClick={setSelectedMessage}
        />

        {/* Message Details Modal */}
        <MessageDetailsModal
          open={!!selectedMessage}
          onOpenChange={(open) => !open && setSelectedMessage(null)}
          message={selectedMessage}
        />
      </div>
    </AdminLayoutV2>
  );
}
