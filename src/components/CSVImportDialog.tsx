import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}

interface StudentRow {
  cin: string;
  prenom: string;
  nom: string;
  email: string;
  date_naissance: string;
  niveau_formation: string;
  specialite: string;
  groupe: string;
  numero_inscription: string;
  type_formation?: string;
  mode_formation?: string;
  annee_formation: string;
}

export const CSVImportDialog = ({
  open,
  onOpenChange,
  onImportSuccess,
}: CSVImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<StudentRow[]>([]);
  const { toast } = useToast();

  const expectedColumns = [
    { key: "cin", label: "CIN", required: true, example: "AB123456" },
    { key: "prenom", label: "Prénom", required: true, example: "Mohamed" },
    { key: "nom", label: "Nom", required: true, example: "ALAMI" },
    { key: "email", label: "Email", required: true, example: "m.alami@ofppt-edu.ma" },
    { key: "date_naissance", label: "Date de Naissance", required: true, example: "2000-01-15" },
    { key: "niveau_formation", label: "Niveau de Formation", required: true, example: "Technicien Spécialisé" },
    { key: "specialite", label: "Spécialité", required: true, example: "Développement Web Full Stack" },
    { key: "groupe", label: "Groupe", required: true, example: "DEVOWFS201" },
    { key: "numero_inscription", label: "Numéro d'Inscription", required: true, example: "INS2024001" },
    { key: "type_formation", label: "Type de Formation", required: false, example: "Résidentielle" },
    { key: "mode_formation", label: "Mode de Formation", required: false, example: "Diplômante" },
    { key: "annee_formation", label: "Année de Formation", required: true, example: "2023-2024" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as StudentRow[];
      
      // Show first 5 rows as preview
      setPreviewData(jsonData.slice(0, 5));
    } catch (error) {
      console.error("Error previewing file:", error);
      toast({
        title: "Erreur",
        description: "Impossible de prévisualiser le fichier",
        variant: "destructive",
      });
    }
  };

  const validateRow = (row: any, index: number): string | null => {
    const requiredFields = expectedColumns.filter(col => col.required);
    
    for (const field of requiredFields) {
      if (!row[field.key] || String(row[field.key]).trim() === "") {
        return `Ligne ${index + 2}: Le champ "${field.label}" est requis`;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) {
      return `Ligne ${index + 2}: Format d'email invalide`;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(row.date_naissance)) {
      return `Ligne ${index + 2}: Format de date invalide (attendu: AAAA-MM-JJ)`;
    }

    return null;
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as StudentRow[];

      if (jsonData.length === 0) {
        throw new Error("Le fichier est vide");
      }

      // Validate all rows
      for (let i = 0; i < jsonData.length; i++) {
        const error = validateRow(jsonData[i], i);
        if (error) {
          throw new Error(error);
        }
      }

      // Fetch existing students to check for duplicates
      const { data: existingStudents, error: fetchError } = await supabase
        .from("students")
        .select("cin, email");

      if (fetchError) throw fetchError;

      const existingCINs = new Set(existingStudents?.map(s => s.cin.toLowerCase()) || []);
      const existingEmails = new Set(existingStudents?.map(s => s.email.toLowerCase()) || []);

      let addedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const cin = String(row.cin).trim();
        const email = String(row.email).trim().toLowerCase();

        // Check for duplicates
        if (existingCINs.has(cin.toLowerCase()) || existingEmails.has(email)) {
          skippedCount++;
          continue;
        }

        // Prepare student data
        const studentData = {
          cin,
          first_name: String(row.prenom).trim(),
          last_name: String(row.nom).trim(),
          email,
          birth_date: String(row.date_naissance).trim(),
          formation_level: String(row.niveau_formation).trim(),
          speciality: String(row.specialite).trim(),
          student_group: String(row.groupe).trim(),
          inscription_number: String(row.numero_inscription).trim(),
          formation_type: row.type_formation ? String(row.type_formation).trim() : "Résidentielle",
          formation_mode: row.mode_formation ? String(row.mode_formation).trim() : "Diplômante",
          formation_year: String(row.annee_formation).trim(),
          password_hash: cin, // Default password is CIN
          password_changed: false,
        };

        // Insert student
        const { error: insertError } = await supabase
          .from("students")
          .insert(studentData);

        if (insertError) {
          errors.push(`Ligne ${i + 2}: ${insertError.message}`);
        } else {
          addedCount++;
          existingCINs.add(cin.toLowerCase());
          existingEmails.add(email);
        }
      }

      // Show results
      if (errors.length > 0) {
        toast({
          title: "Importation terminée avec des erreurs",
          description: `${addedCount} ajoutés, ${skippedCount} ignorés (doublons), ${errors.length} erreurs`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Importation réussie",
          description: `${addedCount} étudiants ajoutés, ${skippedCount} doublons ignorés`,
        });
      }

      onImportSuccess();
      onOpenChange(false);
      setFile(null);
      setPreviewData([]);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Erreur d'importation",
        description: (error as Error).message || "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        cin: "AB123456",
        prenom: "Mohamed",
        nom: "ALAMI",
        email: "m.alami@ofppt-edu.ma",
        date_naissance: "2000-01-15",
        niveau_formation: "Technicien Spécialisé",
        specialite: "Développement Web Full Stack",
        groupe: "DEVOWFS201",
        numero_inscription: "INS2024001",
        type_formation: "Résidentielle",
        mode_formation: "Diplômante",
        annee_formation: "2023-2024",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "modele_import_etudiants.xlsx");

    toast({
      title: "Modèle téléchargé",
      description: "Le fichier modèle a été téléchargé",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importer des étudiants (CSV/Excel)
          </DialogTitle>
          <DialogDescription>
            Importez plusieurs étudiants à partir d'un fichier CSV ou Excel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format Instructions */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Format du fichier requis :</p>
                <div className="text-sm space-y-1">
                  <p>Le fichier doit contenir les colonnes suivantes (respectez l'ordre et les noms exacts) :</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {expectedColumns.map((col) => (
                      <div key={col.key} className="flex items-start gap-2">
                        <span className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                          {col.key}
                        </span>
                        {col.required && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {col.example}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="mt-2"
                >
                  <FileText className="h-3 w-3 mr-2" />
                  Télécharger le modèle
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fichier CSV/Excel</label>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>

          {/* Preview */}
          {previewData.length > 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">Aperçu (5 premières lignes) :</p>
                <div className="text-xs space-y-1 font-mono bg-muted p-2 rounded">
                  {previewData.map((row, i) => (
                    <div key={i}>
                      {row.prenom} {row.nom} - {row.cin} - {row.groupe}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Important Notes */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">Notes importantes :</p>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                <li>Les étudiants avec CIN ou email en double seront ignorés</li>
                <li>Le mot de passe par défaut sera le CIN de l'étudiant</li>
                <li>Le format de date doit être : AAAA-MM-JJ (ex: 2000-01-15)</li>
                <li>Les formats acceptés : CSV, XLSX, XLS</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? "Importation..." : "Importer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
