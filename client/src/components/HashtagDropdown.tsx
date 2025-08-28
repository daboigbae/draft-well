import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { Hash, ChevronDown } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { getHashtagCollections } from "../lib/hashtags";
import { HashtagCollection } from "../types/hashtag";

interface HashtagDropdownProps {
  onInsertHashtags: (hashtags: string) => void;
  className?: string;
}

export default function HashtagDropdown({ onInsertHashtags, className = "" }: HashtagDropdownProps) {
  const { user } = useAuth();
  const [hashtagCollections, setHashtagCollections] = useState<HashtagCollection[]>([]);
  const [loadingHashtags, setLoadingHashtags] = useState(false);
  const [hashtagsOpen, setHashtagsOpen] = useState(false);

  useEffect(() => {
    if (!user || !hashtagsOpen) return;

    const loadHashtagCollections = async () => {
      setLoadingHashtags(true);
      try {
        const collections = await getHashtagCollections(user.uid);
        setHashtagCollections(collections);
      } catch (error) {
        console.error("Failed to load hashtag collections:", error);
        setHashtagCollections([]);
      } finally {
        setLoadingHashtags(false);
      }
    };

    loadHashtagCollections();
  }, [user, hashtagsOpen]);

  const insertHashtagCollection = (hashtags: string[]) => {
    const hashtagText = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
    onInsertHashtags(hashtagText);
    setHashtagsOpen(false);
  };

  return (
    <Popover open={hashtagsOpen} onOpenChange={setHashtagsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`p-2 text-slate-600 hover:bg-white hover:shadow-sm ${className}`}
          data-testid="button-hashtags"
        >
          <Hash className="w-4 h-4" />
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="font-medium text-sm text-gray-900">Insert Hashtag Collection</div>
          
          {loadingHashtags ? (
            <div className="text-sm text-gray-500 py-2">Loading collections...</div>
          ) : hashtagCollections.length === 0 ? (
            <div className="text-sm text-gray-500 py-2">
              No hashtag collections found. Create some in your hashtag collections page.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {hashtagCollections.map((collection) => (
                <div key={collection.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{collection.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertHashtagCollection(collection.hashtags)}
                      className="px-2 py-1 h-auto text-xs"
                      data-testid={`button-insert-collection-${collection.id}`}
                    >
                      Insert
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {collection.hashtags.slice(0, 5).map((hashtag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs px-2 py-0 bg-blue-100 text-blue-800"
                      >
                        {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                      </Badge>
                    ))}
                    {collection.hashtags.length > 5 && (
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        +{collection.hashtags.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}