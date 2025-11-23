import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Mail, Calendar, User } from "lucide-react";

interface MessageDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: any;
}

export const MessageDetailsModal = ({
  open,
  onOpenChange,
  message,
}: MessageDetailsModalProps) => {
  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-between items-center">
            {message.is_read ? (
              <Badge variant="secondary">Lu</Badge>
            ) : (
              <Badge variant="default">Non lu</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {format(new Date(message.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </span>
          </div>

          {/* Sender Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{message.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${message.email}`} className="text-primary hover:underline">
                {message.email}
              </a>
            </div>
          </div>

          {/* Subject */}
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Sujet</h4>
            <p className="text-lg font-medium">{message.subject}</p>
          </div>

          {/* Message Content */}
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Message</h4>
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>

          {/* Response if any */}
          {message.response && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Réponse</h4>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="whitespace-pre-wrap">{message.response}</p>
                {message.responded_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Répondu le {format(new Date(message.responded_at), "d MMMM yyyy", { locale: fr })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
