import React from "react";
import { Link } from "react-router-dom";
import { Clock, Heart, MessageSquare, ArrowRight } from "lucide-react";
import { formatDate } from "../../utils/helpers";

export default function BlogList({ posts = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div key={n} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="h-44 bg-slate-800 rounded-2xl"></div>
            <div className="h-6 bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-16 text-center bg-slate-900/30 rounded-3xl border border-slate-800 text-slate-500 space-y-2">
        <h3 className="text-lg font-bold text-white">No Transmissions Found</h3>
        <p className="text-sm">Check back later or adjust your category filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <article
          key={post.id}
          className="group flex flex-col justify-between bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
        >
          <div>
            <div className="relative aspect-video overflow-hidden bg-slate-950">
              <img
                src={post.thumbnailUrl || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80"}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-blue-400 border border-blue-500/30">
                {post.category || "Intel"}
              </span>
            </div>

            <div className="p-6 space-y-3">
              <div className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={12} /> 4 min</span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                {post.title}
              </h3>

              <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                {post.excerpt || post.content}
              </p>
            </div>
          </div>

          <div className="p-6 pt-0 border-t border-slate-800/40 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><Heart size={14} /> {post.likesCount || 0}</span>
              <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {post.commentsCount || 0}</span>
            </div>

            <Link
              to={`/blog/${post.id}`}
              className="inline-flex items-center gap-1 text-xs font-black text-blue-400 group-hover:translate-x-1 transition-transform"
            >
              READ <ArrowRight size={14} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
