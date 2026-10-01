import React, { useState, useRef, useEffect } from "react";
import {
  FolderTree,
  Folder,
  FolderOpen,
  FileCode,
  Plus,
  FolderPlus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  FileText,
  X,
  Check,
  Filter,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeFile, SupportedLanguage } from "./CodeStudioTypes";
import { useToast } from "@/hooks/use-toast";

interface CodeStudioFileExplorerProps {
  files: CodeFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onAddFile: (name: string, language: SupportedLanguage, folder?: string) => void;
  onAddFolder?: (folderName: string, parentFolder?: string) => void;
  onRenameFile?: (id: string, newName: string) => void;
  onDeleteFile: (id: string) => void;
  onDeleteFolder?: (folderPath: string) => void;
  onOpenTemplatesModal?: () => void;
}

export const CodeStudioFileExplorer: React.FC<CodeStudioFileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onAddFile,
  onAddFolder,
  onRenameFile,
  onDeleteFile,
  onDeleteFolder,
  onOpenTemplatesModal,
}) => {
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    src: true,
    components: true,
    routes: true,
    utils: true,
  });

  // Modals & Inputs
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [targetFolder, setTargetFolder] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemLang, setNewItemLang] = useState<SupportedLanguage>("javascript");

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Keyboard shortcut listener: Pressing "/" or "Ctrl/Cmd+F" focuses the global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        // If focus is not inside editor, focus search
        const activeElement = document.activeElement;
        const isEditorFocused = activeElement?.closest(".monaco-editor");
        if (!isEditorFocused) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      } else if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-expand all folders when user is actively searching to reveal matching items
  useEffect(() => {
    if (searchQuery.trim()) {
      const allExpanded: Record<string, boolean> = { root: true };
      files.forEach((f) => {
        if (f.folder) {
          const parts = f.folder.split("/");
          let curr = "";
          parts.forEach((p) => {
            curr = curr ? `${curr}/${p}` : p;
            allExpanded[curr] = true;
          });
        }
      });
      setExpandedFolders(allExpanded);
    }
  }, [searchQuery, files]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  // Group files by folder
  const foldersMap: Record<string, CodeFile[]> = {};
  const folderPaths = new Set<string>();

  files.forEach((file) => {
    const folder = (file.folder || "").trim();
    if (!foldersMap[folder]) {
      foldersMap[folder] = [];
    }
    foldersMap[folder].push(file);

    if (folder) {
      const parts = folder.split("/");
      let curr = "";
      parts.forEach((p) => {
        curr = curr ? `${curr}/${p}` : p;
        folderPaths.add(curr);
      });
    }
  });

  const sortedFolderList = Array.from(folderPaths).sort();

  // Filtered files calculation
  const cleanQuery = searchQuery.trim().toLowerCase();
  const matchingFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(cleanQuery) ||
      (f.folder && f.folder.toLowerCase().includes(cleanQuery))
  );

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    let detectedLang = newItemLang;
    const lowerName = newItemName.toLowerCase();
    if (lowerName.endsWith(".html")) detectedLang = "html";
    else if (lowerName.endsWith(".css")) detectedLang = "css";
    else if (lowerName.endsWith(".py")) detectedLang = "python";
    else if (lowerName.endsWith(".sql")) detectedLang = "sql";
    else if (lowerName.endsWith(".json")) detectedLang = "json";
    else if (lowerName.endsWith(".ts") || lowerName.endsWith(".tsx")) detectedLang = "typescript";
    else if (lowerName.endsWith(".js") || lowerName.endsWith(".jsx")) detectedLang = "javascript";

    onAddFile(newItemName.trim(), detectedLang, targetFolder);
    toast({ title: "File Created", description: `Added ${newItemName} to ${targetFolder || "root workspace"}.` });

    setShowNewFileModal(false);
    setNewItemName("");
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const fullFolderPath = targetFolder ? `${targetFolder}/${newItemName.trim()}` : newItemName.trim();
    if (onAddFolder) {
      onAddFolder(fullFolderPath);
    } else {
      // Dummy file inside folder to establish folder path
      onAddFile("index.js", "javascript", fullFolderPath);
    }

    setExpandedFolders((prev) => ({ ...prev, [fullFolderPath]: true }));
    toast({ title: "Folder Created", description: `Created folder ${fullFolderPath}.` });

    setShowNewFolderModal(false);
    setNewItemName("");
  };

  const handleRenameSubmit = (fileId: string) => {
    if (!renameValue.trim()) return;
    if (onRenameFile) {
      onRenameFile(fileId, renameValue.trim());
    } else {
      const file = files.find((f) => f.id === fileId);
      if (file) file.name = renameValue.trim();
    }
    setRenamingId(null);
    toast({ title: "Renamed", description: `Updated name to ${renameValue.trim()}` });
  };

  // Helper to highlight matching text in file names
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    return (
      <>
        {before}
        <span className="bg-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-bold px-0.5 rounded-sm">
          {match}
        </span>
        {after}
      </>
    );
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && matchingFiles.length > 0) {
      onSelectFile(matchingFiles[0].id);
      toast({
        title: "File Opened",
        description: `Opened ${matchingFiles[0].name} in Code Editor.`,
      });
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col p-3 space-y-3 shrink-0 font-sans text-xs select-none h-full overflow-hidden text-card-foreground">
      {/* Header: Title and Quick Add Buttons */}
      <div className="flex items-center justify-between pb-2 border-b border-border shrink-0">
        <span className="font-extrabold text-foreground flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
          <FolderTree className="w-4 h-4 text-cyan-500" />
          Workspace Files
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setTargetFolder("");
              setShowNewFileModal(true);
            }}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-cyan-500 transition-colors"
            title="Create File in Root"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setTargetFolder("");
              setShowNewFolderModal(true);
            }}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-cyan-500 transition-colors"
            title="Create New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* GLOBAL SEARCH INPUT ABOVE FILE TREE */}
      <div className="space-y-1.5 shrink-0">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search workspace files by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full text-[11px] pl-8 pr-7 py-1.5 rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              className="absolute right-2 p-0.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Clear search (Esc)"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <span className="absolute right-2 text-[9px] font-mono text-muted-foreground/60 px-1 py-0.5 rounded bg-muted/30 pointer-events-none">
              /
            </span>
          )}
        </div>

        {/* Search Results Summary Tag when active */}
        {cleanQuery && (
          <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <Filter className="w-2.5 h-2.5 text-cyan-500" />
              {matchingFiles.length === 0 ? (
                <span className="text-rose-500 font-bold">0 matching files</span>
              ) : (
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                  {matchingFiles.length} of {files.length} {matchingFiles.length === 1 ? "file" : "files"}
                </span>
              )}
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Scaffold Templates Quick Action */}
      {onOpenTemplatesModal && (
        <button
          onClick={onOpenTemplatesModal}
          className="w-full py-1.5 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/20 text-[11px] flex items-center justify-between transition-all shrink-0"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            Scaffold Project
          </span>
          <span className="text-[9px] bg-cyan-500/20 px-1.5 py-0.5 rounded-full font-mono">Templates</span>
        </button>
      )}

      {/* File Tree Explorer Viewport */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
        {/* Empty State when no search matches */}
        {cleanQuery && matchingFiles.length === 0 ? (
          <div className="py-8 text-center space-y-2 px-2">
            <div className="w-8 h-8 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
              <Search className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-bold text-foreground">No matching files</p>
            <p className="text-[10px] text-muted-foreground">
              No files found matching &quot;{searchQuery}&quot;
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="h-6 text-[10px] rounded-lg mt-1"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <>
            {/* Render Folder Groups */}
            {sortedFolderList.map((folderPath) => {
              const isExpanded = expandedFolders[folderPath] !== false;
              const folderFiles = (foldersMap[folderPath] || []).filter(
                (f) =>
                  !cleanQuery ||
                  f.name.toLowerCase().includes(cleanQuery) ||
                  (f.folder && f.folder.toLowerCase().includes(cleanQuery))
              );

              // If searching and this folder has no matching files, skip rendering it
              if (cleanQuery && folderFiles.length === 0) return null;

              return (
                <div key={folderPath} className="space-y-1">
                  <div
                    onClick={() => toggleFolder(folderPath)}
                    className="group flex items-center justify-between px-2 py-1 rounded-lg hover:bg-muted/50 cursor-pointer font-bold text-foreground text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      )}
                      {isExpanded ? (
                        <FolderOpen className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      ) : (
                        <Folder className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      )}
                      <span className="truncate">{renderHighlightedText(folderPath, searchQuery)}</span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetFolder(folderPath);
                          setShowNewFileModal(true);
                        }}
                        className="p-0.5 hover:text-cyan-500 rounded"
                        title={`Add File to ${folderPath}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      {onDeleteFolder && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFolder(folderPath);
                          }}
                          className="p-0.5 hover:text-rose-500 rounded"
                          title="Delete Folder"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Folder Content */}
                  {isExpanded && (
                    <div className="pl-4 space-y-1 border-l border-border/60 ml-2">
                      {folderFiles.map((file) => {
                        const isActive = file.id === activeFileId;
                        return (
                          <div
                            key={file.id}
                            onClick={() => onSelectFile(file.id)}
                            className={`group flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-all ${
                              isActive
                                ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold"
                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-cyan-500" : ""}`} />
                              {renamingId === file.id ? (
                                <input
                                  type="text"
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRenameSubmit(file.id);
                                  }}
                                  onBlur={() => handleRenameSubmit(file.id)}
                                  autoFocus
                                  className="w-24 px-1 py-0.5 text-[10px] bg-background border border-border text-foreground font-semibold rounded"
                                />
                              ) : (
                                <span className="truncate text-[11px]">
                                  {renderHighlightedText(file.name, searchQuery)}
                                </span>
                              )}
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenamingId(file.id);
                                  setRenameValue(file.name);
                                }}
                                className="p-0.5 hover:text-cyan-500 rounded"
                                title="Rename File"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              {files.length > 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteFile(file.id);
                                  }}
                                  className="p-0.5 hover:text-rose-500 rounded"
                                  title="Delete File"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Root Files (No folder) */}
            {(() => {
              const rootFiles = (foldersMap[""] || []).filter(
                (f) =>
                  !cleanQuery ||
                  f.name.toLowerCase().includes(cleanQuery)
              );

              if (rootFiles.length === 0) return null;

              return (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                    Root Files
                  </span>
                  {rootFiles.map((file) => {
                    const isActive = file.id === activeFileId;
                    return (
                      <div
                        key={file.id}
                        onClick={() => onSelectFile(file.id)}
                        className={`group flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-all ${
                          isActive
                            ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold"
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-cyan-500" : ""}`} />
                          {renamingId === file.id ? (
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameSubmit(file.id);
                              }}
                              onBlur={() => handleRenameSubmit(file.id)}
                              autoFocus
                              className="w-24 px-1 py-0.5 text-[10px] bg-background border border-border text-foreground font-semibold rounded"
                            />
                          ) : (
                            <span className="truncate text-[11px]">
                              {renderHighlightedText(file.name, searchQuery)}
                            </span>
                          )}
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingId(file.id);
                              setRenameValue(file.name);
                            }}
                            className="p-0.5 hover:text-cyan-500 rounded"
                            title="Rename File"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {files.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFile(file.id);
                              }}
                              className="p-0.5 hover:text-rose-500 rounded"
                              title="Delete File"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* CREATE FILE MODAL */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateFileSubmit}
            className="w-full max-w-sm bg-card border border-border p-5 rounded-2xl shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-cyan-500" />
                New Workspace File
              </h4>
              <button type="button" onClick={() => setShowNewFileModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Folder</label>
                <input
                  type="text"
                  value={targetFolder}
                  onChange={(e) => setTargetFolder(e.target.value)}
                  placeholder="e.g. src/components or leave empty for root"
                  className="w-full mt-1 p-2 rounded-xl bg-muted/40 border border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">File Name</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. main.js, styles.css, app.py"
                  autoFocus
                  required
                  className="w-full mt-1 p-2 rounded-xl bg-muted/40 border border-border text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowNewFileModal(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                Create File
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateFolderSubmit}
            className="w-full max-w-sm bg-card border border-border p-5 rounded-2xl shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-cyan-500" />
                New Workspace Folder
              </h4>
              <button type="button" onClick={() => setShowNewFolderModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Folder Name / Path</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. src/utils, components, routes"
                  autoFocus
                  required
                  className="w-full mt-1 p-2 rounded-xl bg-muted/40 border border-border text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowNewFolderModal(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                Create Folder
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
