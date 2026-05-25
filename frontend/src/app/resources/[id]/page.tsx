"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function ResourceDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const cleanId = id.replace("article-", "");

        const res = await fetch(
          `${API_BASE_URL}/learning-resources/${cleanId}`
        );

        const data = await res.json();

        setResource(data.article);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResource();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 text-white">
        Loading resource...
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-20 text-red-500">
        Resource not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-white">
      {resource.image_url && (
        <img
          src={resource.image_url}
          alt={resource.title}
          className="w-full h-80 object-cover rounded-xl mb-6"
        />
      )}

      <h1 className="text-4xl font-bold mb-4">
        {resource.title}
      </h1>

      <p className="text-slate-400 mb-6">
        By {resource.author}
      </p>

      <div className="text-lg leading-8 text-slate-300 whitespace-pre-line">
        {resource.content_en}
      </div>
    </div>
  );
}