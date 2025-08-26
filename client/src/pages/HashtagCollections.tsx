import { Button } from "../components/ui/button";
import AppLayout from "./AppLayout";
import HashtagCollectionManager from "../components/HashtagCollectionManager";

export default function HashtagCollections() {

  return (
    <AppLayout>
      <div className="flex-1 p-8" data-testid="hashtag-collections-page">
        <div className="max-w-4xl mx-auto">

          {/* Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2" data-testid="title-hashtag-collections">
                Hashtag Collections
              </h1>
              <p className="text-slate-600">
                Create and manage reusable hashtag collections to quickly add relevant hashtags to your posts.
              </p>
            </div>

            <HashtagCollectionManager showInsertButtons={false} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}