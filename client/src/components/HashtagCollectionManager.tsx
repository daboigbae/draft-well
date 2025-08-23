import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Hash, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { 
  createHashtagCollection, 
  updateHashtagCollection, 
  deleteHashtagCollection, 
  subscribeToHashtagCollections 
} from "../lib/hashtags";
import { HashtagCollection } from "../types/hashtag";

interface HashtagCollectionManagerProps {
  onSelectCollection?: (hashtags: string[]) => void;
  showInsertButtons?: boolean;
}

export default function HashtagCollectionManager({ 
  onSelectCollection, 
  showInsertButtons = false 
}: HashtagCollectionManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collections, setCollections] = useState<HashtagCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCollection, setEditingCollection] = useState<HashtagCollection | null>(null);
  const [formData, setFormData] = useState({ name: "", hashtags: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToHashtagCollections(user.uid, (collections) => {
      setCollections(collections);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleCreateCollection = async () => {
    if (!user || !formData.name.trim()) return;

    setSubmitting(true);
    try {
      const hashtags = formData.hashtags
        .split(/[,\s]+/)
        .map(tag => tag.trim())
        .filter(tag => tag)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

      await createHashtagCollection(user.uid, {
        name: formData.name.trim(),
        hashtags,
      });

      setShowCreateDialog(false);
      setFormData({ name: "", hashtags: "" });
      toast({
        title: "Collection created",
        description: "Your hashtag collection has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to create collection",
        description: "There was an error creating your hashtag collection.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCollection = async () => {
    if (!user || !editingCollection || !formData.name.trim()) return;

    setSubmitting(true);
    try {
      const hashtags = formData.hashtags
        .split(/[,\s]+/)
        .map(tag => tag.trim())
        .filter(tag => tag)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

      await updateHashtagCollection(user.uid, editingCollection.id, {
        name: formData.name.trim(),
        hashtags,
      });

      setEditingCollection(null);
      setFormData({ name: "", hashtags: "" });
      toast({
        title: "Collection updated",
        description: "Your hashtag collection has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update collection",
        description: "There was an error updating your hashtag collection.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!user) return;

    try {
      await deleteHashtagCollection(user.uid, collectionId);
      toast({
        title: "Collection deleted",
        description: "Your hashtag collection has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete collection",
        description: "There was an error deleting your hashtag collection.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (collection: HashtagCollection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      hashtags: collection.hashtags.join(' '),
    });
  };

  const handleInsertCollection = (hashtags: string[]) => {
    if (onSelectCollection) {
      onSelectCollection(hashtags);
      toast({
        title: "Hashtags inserted",
        description: `Added ${hashtags.length} hashtags to your post.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="hashtag-collection-manager">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-800">Hashtag Collections</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-create-collection">
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Hashtag Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Collection Name
                </label>
                <Input
                  placeholder="e.g. Tech Startup, Marketing, Personal Brand"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="input-collection-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Hashtags (separate with spaces or commas)
                </label>
                <Input
                  placeholder="startup tech entrepreneur innovation business"
                  value={formData.hashtags}
                  onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                  data-testid="input-collection-hashtags"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Don't worry about the # symbol - we'll add it automatically
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setFormData({ name: "", hashtags: "" });
                  }}
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCollection}
                  disabled={submitting || !formData.name.trim()}
                  data-testid="button-save-collection"
                >
                  {submitting ? "Creating..." : "Create Collection"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <Alert>
          <Hash className="h-4 w-4" />
          <AlertDescription>
            No hashtag collections yet. Create your first collection to save and reuse hashtag lists.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
              data-testid={`collection-${collection.id}`}
            >
              {editingCollection?.id === collection.id ? (
                <div className="space-y-3">
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="input-edit-name"
                  />
                  <Input
                    value={formData.hashtags}
                    onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                    data-testid="input-edit-hashtags"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleUpdateCollection}
                      disabled={submitting}
                      data-testid="button-save-edit"
                    >
                      {submitting ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCollection(null);
                        setFormData({ name: "", hashtags: "" });
                      }}
                      data-testid="button-cancel-edit"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-800" data-testid={`text-collection-name-${collection.id}`}>
                      {collection.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      {showInsertButtons && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInsertCollection(collection.hashtags)}
                          data-testid={`button-insert-${collection.id}`}
                        >
                          Insert
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(collection)}
                        data-testid={`button-edit-${collection.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCollection(collection.id)}
                        data-testid={`button-delete-${collection.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {collection.hashtags.map((hashtag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                        data-testid={`hashtag-${collection.id}-${index}`}
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}