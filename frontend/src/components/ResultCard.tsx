"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type SearchResult } from "@/lib/api";
import { FileText, File } from "lucide-react";

interface ResultCardProps {
  result: SearchResult;
  index: number;
}

export function ResultCard({ result, index }: ResultCardProps) {
  const pathParts = result.filename.split(/[\\\/]/);
  const fileName = pathParts[pathParts.length - 1];
  const folderPath = pathParts.slice(0, -1).join(" › ");
  const fileIcon = result.file_type === "PDF" ? FileText : File;
  const Icon = fileIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-2xl transition-all backdrop-blur-xl bg-white/[0.03] border-white/[0.1] hover:border-purple-400/30">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/[0.05]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/[0.1] text-white/90 border-white/[0.2]">#{index + 1}</Badge>
                <Icon className="h-4 w-4 text-white/60" />
                <h3 className="font-semibold text-lg text-white">{fileName}</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                  {(result.score * 100).toFixed(1)}% Match
                </Badge>
                {result.tfidf_score !== undefined && (
                  <>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                      📊 TF-IDF: {(result.tfidf_score * 100).toFixed(1)}%
                    </Badge>
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
                      ⚡ BM25: {(result.bm25_score! * 100).toFixed(1)}%
                    </Badge>
                    <Badge className="bg-violet-500/20 text-violet-300 border-violet-400/30">
                      🧠 Semantic: {(result.semantic_score! * 100).toFixed(1)}%
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Summary */}
          {result.summary && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-white">
                📝 SUMMARY
              </h4>
              <p
                className="text-sm text-white/70"
                dangerouslySetInnerHTML={{ __html: result.summary }}
              />
            </div>
          )}

          {/* Key Points */}
          {result.key_points && result.key_points.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-white">
                📌 MATCHED CONCEPTS
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {result.key_points.map((point, i) => (
                  <li
                    key={i}
                    className="text-sm text-white/70"
                    dangerouslySetInnerHTML={{ __html: point }}
                  />
                ))}
              </ul>
            </div>
          )}

          {/* Images */}
          {result.images && result.images.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-white">
                🖼️ FOUND IMAGES ({result.images.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {result.images.map((img, i) => {
                  let imgSrc: string;
                  if (typeof img === "string") {
                    imgSrc = img.startsWith("data:") ? img : `data:image/png;base64,${img}`;
                  } else {
                    imgSrc = img.data;
                  }

                  return (
                    <div key={i} className="relative group">
                      <img
                        src={imgSrc}
                        alt={`Document image ${i + 1}`}
                        className="w-full h-48 object-contain border border-white/[0.1] rounded-lg bg-white/[0.02] hover:scale-105 transition-transform"
                      />
                      {typeof img === "object" && img.page && (
                        <Badge className="absolute bottom-2 right-2 bg-white/[0.1] text-white border-white/[0.2]">
                          Page {img.page}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/[0.1]">
            <div>
              <div className="text-xs text-white/40">Folder</div>
              <div className="text-sm font-medium text-white/80">{folderPath || "Root"}</div>
            </div>
            <div>
              <div className="text-xs text-white/40">Type</div>
              <div className="text-sm font-medium text-white/80">{result.file_type || "Unknown"}</div>
            </div>
            {result.file_size && (
              <div>
                <div className="text-xs text-white/40">Size</div>
                <div className="text-sm font-medium text-white/80">{result.file_size}</div>
              </div>
            )}
            {result.modified_date && (
              <div>
                <div className="text-xs text-white/40">Modified</div>
                <div className="text-sm font-medium text-white/80">{result.modified_date}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
