
import React from "react";
import { Designer } from "@/services/designerTypes";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface DesignersTableProps {
  designers: Designer[];
  onEdit: (designer: Designer) => void;
  onDelete: (id: string) => Promise<void>;
}

const DesignersTable = ({ designers, onEdit, onDelete }: DesignersTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {designers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                No designers found
              </TableCell>
            </TableRow>
          ) : (
            designers.map((designer) => (
              <TableRow key={designer.id}>
                <TableCell>{designer.full_name}</TableCell>
                <TableCell>{designer.email || "N/A"}</TableCell>
                <TableCell className="capitalize">{designer.specialty}</TableCell>
                <TableCell>{designer.featured ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(designer)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(designer.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DesignersTable;
