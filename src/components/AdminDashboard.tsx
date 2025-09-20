import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  UserCog,
  Download,
  Users,
  Filter,
  LogOut,
  Clock,
  Check,
  X,
  CalendarDays,
  ChartBar,
  Timer,
  TrendingUp,
  School,
  Target,
  AlertCircle,
  Mail,
  FileText,
  BarChart3,
  GraduationCap,
  Settings,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Calendar,
  Filter as FilterIcon,
} from "lucide-react";
import { AttestationGenerator } from './AttestationGenerator';

interface AttestationRequest {
  id: string;
  first_name: string;
  last_name: string;
  cin: string;
  email: string;
  student_group: string;
  status: string;
  created_at: string;
  student_id?: string;
  year_requested: number;
  rejection_reason?: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  cin: string;
  email: string;
  birth_date: string;
  formation_level: string;
  speciality: string;
  student_group: string;
  inscription_number: string;
  formation_type: string;
  formation_mode: string;
  formation_year: string;
}

interface AdminDashboardProps {
  adminProfile: string;
  onLogout: () => void;
}

// Définition des groupes par filière pour un meilleur ordre d'affichage
const STUDENT_GROUPS = [
  // DEVOWFS en premier
  "DEVOWFS201",
  "DEVOWFS202",
  "DEVOWFS203",
  "DEVOWFS204",
  // IDOSR en deuxième
  "IDOSR201",
  "IDOSR202",
  "IDOSR203",
  "IDOSR204",
  // DEV en troisième
  "DEV101",
  "DEV102",
  "DEV103",
  "DEV104",
  "DEV105",
  "DEV106",
  "DEV107",
  // ID en dernier
  "D101",
  "ID102",
  "ID103",
  "ID104",
];

const AdminDashboard = ({ adminProfile, onLogout }: AdminDashboardProps) => {
  const [requests, setRequests] = useState<AttestationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<
    AttestationRequest[]
  >([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [hourFilter, setHourFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showAttestation, setShowAttestation] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = [...requests];

    // Filtre par groupe
    if (selectedGroup !== "all") {
      filtered = filtered.filter((req) => req.student_group === selectedGroup);
    }

    // Filtre par statut
    if (selectedStatus !== "all") {
      filtered = filtered.filter((req) => req.status === selectedStatus);
    }

    // Filtre par recherche (nom, prénom, CIN)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.first_name.toLowerCase().includes(searchLower) ||
          req.last_name.toLowerCase().includes(searchLower) ||
          req.cin.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.created_at);
        return requestDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filtre par heure
    if (hourFilter !== "all") {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.created_at);
        const hour = requestDate.getHours();
        
        switch (hourFilter) {
          case "morning":
            return hour >= 6 && hour < 12;
          case "afternoon":
            return hour >= 12 && hour < 18;
          case "evening":
            return hour >= 18 && hour < 24;
          case "night":
            return hour >= 0 && hour < 6;
          default:
            return true;
        }
      });
    }

    setFilteredRequests(filtered);
  }, [requests, selectedGroup, selectedStatus, searchTerm, dateFilter, hourFilter]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("attestation_requests")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string, rejectionReason?: string) => {
    try {
      const { error } = await supabase
        .from("attestation_requests")
        .update({ 
          status: newStatus,
          ...(rejectionReason && { rejection_reason: rejectionReason })
        })
        .eq("id", id);

      if (error) throw error;

      // Envoyer un email de notification
      try {
        const { error: emailError } = await supabase.functions.invoke('send-notification', {
          body: {
            requestId: id,
            status: newStatus,
            rejectionReason
          }
        });
        
        if (emailError) {
          console.error('Error sending email:', emailError);
          toast({
            title: "Statut mis à jour",
            description: "Le statut a été mis à jour mais l'email de notification n'a pas pu être envoyé.",
            variant: "destructive",
          });
        } else {
          toast({
            title: newStatus === 'approved' ? "Demande approuvée" : "Demande rejetée",
            description: "L'étudiant a été notifié par email.",
          });
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        toast({
          title: "Statut mis à jour",
          description: "Le statut a été mis à jour mais l'email de notification n'a pas pu être envoyé.",
          variant: "destructive",
        });
      }

      await fetchRequests();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from("attestation_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRequests((prev) => prev.filter((req) => req.id !== id));

      toast({
        title: "Demande supprimée",
        description: "La demande a été supprimée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la demande.",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    // Grouper les demandes par groupe
    const groupedRequests = STUDENT_GROUPS.reduce((acc, group) => {
      const requests = filteredRequests.filter(
        (req) => req.student_group === group
      );
      if (requests.length > 0) {
        acc[group] = requests;
      }
      return acc;
    }, {} as Record<string, AttestationRequest[]>);

    // Importer jsPDF
    import("jspdf").then(async ({ default: JsPDF }) => {
      const { default: autoTable } = await import("jspdf-autotable");

      // Créer un nouveau document PDF
      const doc = new JsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Ajouter le titre principal
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Liste des demandes d'attestation par groupe", 15, 15);

      // Ajouter la date d'export
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")}`, 15, 22);

      const columns = [
        "Prénom",
        "Nom",
        "CIN",
        "Email",
        "Statut",
        "Date de création",
      ];

      let startY = 30;

      // Pour chaque groupe, créer une section dans le PDF
      Object.entries(groupedRequests).forEach(([group, requests], index) => {
        // Ajouter un en-tête de groupe
        if (index > 0) {
          startY = (doc as any).lastAutoTable.finalY + 10;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(
          `Groupe ${group} (${requests.length} étudiant${
            requests.length > 1 ? "s" : ""
          })`,
          15,
          startY
        );

        const tableData = requests.map((req) => [
          req.first_name,
          req.last_name,
          req.cin,
          req.email,
          getStatusLabel(req.status),
          new Date(req.created_at).toLocaleDateString("fr-FR"),
        ]);

        autoTable(doc, {
          startY: startY + 5,
          head: [columns],
          body: tableData,
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [51, 65, 85],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250],
          },
        });
      });

      // Sauvegarder le PDF
      doc.save(
        `attestation_requests_par_groupe_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );

      toast({
        title: "Export réussi",
        description: `${filteredRequests.length} demandes exportées en PDF, groupées par classe.`,
      });
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "approved":
        return "Approuvé";
      case "rejected":
        return "Rejeté";
      default:
        return status;
    }
  };

  const generateAttestation = async (request: AttestationRequest) => {
    try {
      // Vérifier si student_id existe
      if (!request.student_id) {
        // Chercher l'étudiant par email/CIN comme fallback
        const { data: studentData, error } = await supabase
          .from("students")
          .select("*")
          .eq("cin", request.cin)
          .single();

        if (error) throw error;

        setShowAttestation({
          student: studentData,
          request: request
        });
      } else {
        // Récupérer les données complètes de l'étudiant par ID
        const { data: studentData, error } = await supabase
          .from("students")
          .select("*")
          .eq("id", request.student_id)
          .single();

        if (error) throw error;

        setShowAttestation({
          student: studentData,
          request: request
        });
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de l'étudiant.",
        variant: "destructive",
      });
    }
  };

  const handlePrintAttestation = () => {
    window.print();
  };

  const resetAttestationCounter = async () => {
    try {
      const { error } = await supabase.rpc('reset_attestation_counter', {
        reset_by_admin: adminProfile
      });
      
      if (error) throw error;
      
      toast({
        title: "Compteur réinitialisé",
        description: "Le compteur d'attestations a été remis à zéro.",
      });
    } catch (error) {
      console.error('Error resetting counter:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le compteur.",
        variant: "destructive",
      });
    }
  };

  const getFiliere = (group: string) => {
    if (group.startsWith("DEVOWFS")) return "DEVOWFS";
    if (group.startsWith("IDOSR")) return "IDOSR";
    if (group.startsWith("DEV")) return "DEV";
    if (group.startsWith("ID")) return "ID";
    return "Autre";
  };

  const groupStats = STUDENT_GROUPS.map((group) => ({
    group,
    count: requests.filter((req) => req.student_group === group).length,
    filiere: getFiliere(group),
  })).filter((stat) => stat.count > 0);

  const filiereStats = ["DEVOWFS", "IDOSR", "DEV", "ID"].map((filiere) => {
    const filiereRequests = requests.filter(
      (r) => getFiliere(r.student_group) === filiere
    );
    const approvedRequests = filiereRequests.filter(
      (r) => r.status === "approved"
    );
    return {
      filiere,
      total: filiereRequests.length,
      approved: approvedRequests.length,
      approvalRate:
        filiereRequests.length > 0
          ? Math.round((approvedRequests.length / filiereRequests.length) * 100)
          : 0,
    };
  });

  if (showAttestation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="p-4">
          <Button
            onClick={() => setShowAttestation(null)}
            variant="outline"
            className="mb-4"
          >
            ← Retour au tableau de bord
          </Button>
          <AttestationGenerator 
            attestationData={{
              student: showAttestation.student,
              request: showAttestation.request
            }}
            onPrint={handlePrintAttestation}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-slate-600 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-xl shadow-lg">
                <UserCog className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Tableau de Bord Administrateur
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Connecté en tant que: <span className="text-blue-700">{adminProfile}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex items-center gap-2 bg-white/80 hover:bg-red-50 border-red-200 text-red-700 hover:text-red-800 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total des demandes</CardTitle>
              <Users className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{requests.length}</div>
              <p className="text-xs text-blue-100 mt-1">
                +{requests.filter(r => new Date(r.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} cette semaine
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-100">En attente</CardTitle>
              <Clock className="h-5 w-5 text-amber-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {requests.filter((r) => r.status === "pending").length}
              </div>
              <p className="text-xs text-amber-100 mt-1">
                Nécessitent une action
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">Approuvées</CardTitle>
              <Check className="h-5 w-5 text-emerald-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {requests.filter((r) => r.status === "approved").length}
              </div>
              <p className="text-xs text-emerald-100 mt-1">
                {requests.length > 0 ? Math.round((requests.filter((r) => r.status === "approved").length / requests.length) * 100) : 0}% du total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100">Rejetées</CardTitle>
              <X className="h-5 w-5 text-red-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {requests.filter((r) => r.status === "rejected").length}
              </div>
              <p className="text-xs text-red-100 mt-1">
                {requests.length > 0 ? Math.round((requests.filter((r) => r.status === "rejected").length / requests.length) * 100) : 0}% du total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Program Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {filiereStats.map((stat, index) => (
            <Card key={stat.filiere} className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    index === 0 ? 'bg-purple-100 text-purple-600' :
                    index === 1 ? 'bg-teal-100 text-teal-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-pink-100 text-pink-600'
                  }`}>
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  {stat.filiere}
                </CardTitle>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-medium">
                  {stat.total}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Approuvées:</span>
                    <span className="font-bold text-emerald-600">{stat.approved}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${stat.total > 0 ? (stat.approved / stat.total) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Taux d'approbation: <span className="text-emerald-600 font-bold">{stat.approvalRate}%</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Actions */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FilterIcon className="h-5 w-5 text-blue-600" />
              </div>
              Filtres et Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="group" className="text-sm font-medium text-slate-700">Groupe</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="bg-white border-slate-200 hover:border-blue-300 transition-colors">
                    <SelectValue placeholder="Tous les groupes" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-xl z-50 rounded-lg">
                    <SelectItem value="all">Tous les groupes</SelectItem>
                    {STUDENT_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-slate-700">Statut</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-white border-slate-200 hover:border-blue-300 transition-colors">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-xl z-50 rounded-lg">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-slate-700">Date</Label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-white border-slate-200 hover:border-blue-300 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hour" className="text-sm font-medium text-slate-700">Période</Label>
                <Select value={hourFilter} onValueChange={setHourFilter}>
                  <SelectTrigger className="bg-white border-slate-200 hover:border-blue-300 transition-colors">
                    <SelectValue placeholder="Toute la journée" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-xl z-50 rounded-lg">
                    <SelectItem value="all">Toute la journée</SelectItem>
                    <SelectItem value="morning">Matin (6h-12h)</SelectItem>
                    <SelectItem value="afternoon">Après-midi (12h-18h)</SelectItem>
                    <SelectItem value="evening">Soir (18h-24h)</SelectItem>
                    <SelectItem value="night">Nuit (0h-6h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-slate-700">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Nom, prénom, CIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-slate-200 hover:border-blue-300 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Actions</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={exportToPDF}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button
                    onClick={resetAttestationCounter}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              Demandes d'attestation ({filteredRequests.length})
            </CardTitle>
            <CardDescription className="text-slate-600">
              Gérez les demandes d'attestation de scolarité par groupe d'étudiants
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              {STUDENT_GROUPS.map((group) => {
                const groupRequests = filteredRequests.filter(
                  (req) => req.student_group === group
                );

                if (groupRequests.length === 0) return null;

                return (
                  <div key={group} className="border-2 border-slate-200 rounded-xl p-6 bg-gradient-to-br from-white to-slate-50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <GraduationCap className="h-6 w-6 text-blue-600" />
                        </div>
                        Groupe {group}
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 font-bold text-sm px-3 py-1">
                          {groupRequests.length} demande{groupRequests.length > 1 ? "s" : ""}
                        </Badge>
                      </h3>
                      <Badge 
                        variant="outline" 
                        className="bg-slate-100 text-slate-700 border-slate-300 font-medium px-3 py-1"
                      >
                        {getFiliere(group)}
                      </Badge>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 hover:bg-slate-50">
                            <TableHead className="font-semibold text-slate-700">Étudiant</TableHead>
                            <TableHead className="font-semibold text-slate-700">CIN</TableHead>
                            <TableHead className="font-semibold text-slate-700">Email</TableHead>
                            <TableHead className="font-semibold text-slate-700">Statut</TableHead>
                            <TableHead className="font-semibold text-slate-700">Date</TableHead>
                            <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                           {groupRequests.map((request) => {
                             // Get student request count for this year
                             const studentEmail = request.email;
                             const requestCount = requests.filter(r => 
                               r.email === studentEmail && 
                               r.year_requested === new Date().getFullYear()
                             ).length;

                             return (
                             <TableRow key={request.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                               <TableCell className="font-medium text-slate-800">
                                 <div className="flex flex-col">
                                   <span>{request.first_name} {request.last_name}</span>
                                   <span className="text-xs text-slate-500">
                                     {requestCount}/3 demandes cette année
                                   </span>
                                 </div>
                               </TableCell>
                               <TableCell className="text-slate-600">{request.cin}</TableCell>
                               <TableCell className="text-slate-600">{request.email}</TableCell>
                               <TableCell>
                                 <Badge 
                                   variant={getStatusBadgeVariant(request.status)}
                                   className="font-medium"
                                 >
                                   {getStatusLabel(request.status)}
                                 </Badge>
                               </TableCell>
                               <TableCell className="text-slate-600">
                                 {new Date(request.created_at).toLocaleDateString("fr-FR")}
                               </TableCell>
                               <TableCell>
                                 <div className="flex items-center gap-2">
                                   {request.status === "pending" && (
                                     <>
                                       <Button
                                         onClick={() => updateStatus(request.id, "approved")}
                                         size="sm"
                                         className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                                       >
                                         <Check className="h-4 w-4" />
                                       </Button>
                                       <Button
                                         onClick={() => {
                                           const reason = prompt("Raison du rejet (optionnel):");
                                           updateStatus(request.id, "rejected", reason || undefined);
                                         }}
                                         size="sm"
                                         variant="destructive"
                                         className="shadow-sm hover:shadow-md transition-all duration-200"
                                       >
                                         <X className="h-4 w-4" />
                                       </Button>
                                     </>
                                   )}
                                   {request.status === "approved" && (
                                     <Button
                                       onClick={() => generateAttestation(request)}
                                       size="sm"
                                       variant="outline"
                                       className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm hover:shadow-md transition-all duration-200"
                                     >
                                       <Eye className="h-4 w-4" />
                                     </Button>
                                   )}
                                   <Button
                                     onClick={() => deleteRequest(request.id)}
                                     size="sm"
                                     variant="outline"
                                     className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shadow-sm hover:shadow-md transition-all duration-200"
                                   >
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                                 </div>
                               </TableCell>
                             </TableRow>
                           )}
                           )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })}

              {filteredRequests.length === 0 && (
                <div className="text-center py-16">
                  <div className="p-4 bg-slate-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <AlertCircle className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">
                    Aucune demande trouvée
                  </h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Aucune demande ne correspond aux filtres sélectionnés. Essayez de modifier vos critères de recherche.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;