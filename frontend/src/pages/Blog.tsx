import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Editor } from "@tinymce/tinymce-react";
import { X, Plus } from "lucide-react";

type ImageProps = {
  src: string;
  alt?: string;
};

type BlogPost = {
  id: number;
  url: string;
  image: ImageProps;
  category: string;
  readTime: string;
  title: string;
  description: string;
  content: string;
  avatar: ImageProps;
  fullName: string;
  date: string;
};

type Props = {
  tagline: string;
  heading: string;
  description: string;
  button: {
    title: string;
    variant?: "secondary" | string;
  };
  blogPosts: BlogPost[];
};

export type BlogProps = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

const ITEMS_PER_PAGE = 4;
const BACKEND_BASE_URL = "http://localhost:4000";

function resolvePostImageSrc(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg";
  }
  // If it is a local upload path, prefix backend
  if (imageUrl.startsWith("/uploads/")) return `${BACKEND_BASE_URL}${imageUrl}`;
  // Otherwise assume it is already a full URL
  return imageUrl;
}

export const Blog = (props: BlogProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isAddBlogModalOpen, setIsAddBlogModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    description: string;
    content: string;
    imageFile: File | null;
    readTime: string;
  }>({
    title: "",
    category: "",
    description: "",
    content: "",
    imageFile: null,
    readTime: "",
  });

  const TINYMCE_KEY = import.meta.env.VITE_TINYMCE_API_KEY || "";

  const openBlogModal = (post: BlogPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const openAddBlogModal = () => {
    setIsAddBlogModalOpen(true);
  };

  const closeAddBlogModal = () => {
    setIsAddBlogModalOpen(false);
    setFormData({
      title: "",
      category: "",
      description: "",
      content: "",
      imageFile: null,
      readTime: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
    }));
  };

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Morate biti ulogovani da biste kreirali blog post.");
      return;
    }

    // Require image upload (since previously it was required as URL)
    if (!formData.imageFile) {
      alert("Molimo dodajte sliku (upload).");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("category", formData.category);
      fd.append("readTime", formData.readTime);
      fd.append("shortDesc", formData.description);
      fd.append("content", formData.content);
      fd.append("image", formData.imageFile);

      const res = await fetch("http://localhost:4000/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      if (!res.ok) {
        let errBody: any = null;
        try {
          errBody = await res.json();
        } catch (_) {}

        console.error("Greška pri kreiranju bloga:", res.status, errBody);

        if (res.status === 401) {
          alert("Sesija je istekla. Molimo prijavite se ponovo.");
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        alert(errBody?.message || "Neuspješno kreiranje blog posta.");
        return;
      }

      const created = await res.json();
      console.log("Kreirani post:", created);

      fetchPosts();
      closeAddBlogModal();
      alert("Blog post je uspešno kreiran!");
    } catch (err) {
      console.error("Network/JS greška pri kreiranju bloga:", err);
      alert("Došlo je do greške prilikom slanja bloga.");
    }
  };

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      // Dohvati sve blogove odjednom (bez paginacije)
      const res = await fetch("http://localhost:4000/api/posts?limit=100");
      if (!res.ok) {
        console.error("Neuspješno dohvatanje objava:", res.status);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const postsArray = data.posts || data;

      const mapped: BlogPost[] = postsArray.map((post: any) => ({
        id: post.id,
        url: `/blog/${post.id}`,
        image: {
          src: resolvePostImageSrc(post.image_url),
          alt: post.title,
        },
        category: post.category,
        readTime: post.read_time || "5 min čitanja",
        title: post.title,
        description: post.short_desc,
        content: post.content || "",
        avatar: {
          src: post.users?.profile_picture
            ? `http://localhost:4000${post.users.profile_picture}?t=${Date.now()}`
            : "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
          alt: post.users
            ? `${post.users.first_name} ${post.users.last_name}`
            : "Autor",
        },
        fullName: post.users
          ? `${post.users.first_name} ${post.users.last_name}`
          : "Nepoznat autor",
        date: post.created_at ? new Date(post.created_at).toLocaleDateString() : "",
      }));

      // Backend već vraća blogove sortirane po created_at DESC (najnoviji prvi)
      setPosts(mapped);
    } catch (err) {
      console.error("Greška pri dohvatanju objava:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const [showAll, setShowAll] = useState(false);

  const blogPosts = posts;
  const visiblePosts = blogPosts.slice(0, ITEMS_PER_PAGE);
  const hiddenPosts = blogPosts.slice(ITEMS_PER_PAGE);
  const hasMorePosts = blogPosts.length > ITEMS_PER_PAGE;

  const renderCard = (post: BlogPost, index: number, isHidden: boolean = false) => {
    // Uklanjamo logiku za centriranje - svi blogovi trebaju biti iste veličine
    return (
      <div
        key={post.id}
        className={`${isHidden ? "animate-slide-in" : "animate-fade-in"}`}
        style={
          isHidden
            ? { animationDelay: `${index * 100}ms`, animationFillMode: "both" }
            : { animationDelay: `${index * 150}ms`, animationFillMode: "both" }
        }
      >
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden border border-gray-100 hover:border-[#294a70]/30 h-full flex flex-col group">
          <div onClick={() => openBlogModal(post)} className="cursor-pointer relative overflow-hidden">
            <div className="w-full overflow-hidden">
              <img
                src={post.image.src}
                alt={post.image.alt}
                className="aspect-[4/3] size-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          <div className="p-4 flex flex-col flex-1">
            <button
              onClick={() => openBlogModal(post)}
              className="mb-2 inline-block px-2 py-1 bg-[#294a70] text-white text-xs font-semibold rounded-full hover:bg-[#1f3854] transition-all duration-300 transform hover:scale-105 cursor-pointer w-fit"
            >
              {post.category}
            </button>

            <div onClick={() => openBlogModal(post)} className="mb-2 block cursor-pointer flex-1">
              <h5 className="text-lg font-bold text-[#294a70] hover:text-[#1f3854] transition-all duration-300 line-clamp-2 group-hover:text-[#ffab1f]">
                {post.title}
              </h5>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1 transition-colors duration-300 group-hover:text-gray-700">
              {post.description}
            </p>

            <div className="flex items-center pt-3 border-t border-gray-100 mt-auto transition-all duration-300 group-hover:border-[#294a70]/20">
              <div className="mr-3 shrink-0">
                <img
                  src={post.avatar.src}
                  alt={post.avatar.alt}
                  className="size-8 min-h-8 min-w-8 rounded-full object-cover border-2 border-gray-200 transition-all duration-300 group-hover:border-[#294a70]/30 group-hover:scale-110"
                />
              </div>
              <div className="flex-1">
                <h6 className="text-xs font-semibold text-gray-900 transition-colors duration-300 group-hover:text-[#294a70]">
                  {post.fullName}
                </h6>
                <div className="flex items-center text-gray-500 transition-colors duration-300 group-hover:text-gray-600">
                  <p className="text-xs">{post.date}</p>
                  <span className="mx-1 text-xs">•</span>
                  <p className="text-xs">{post.readTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <section id="relume" className="px-[5%] py-20 md:py-28 lg:py-32 bg-[#294a70] min-h-screen">
        <div className="container">
          <div className="mb-16 md:mb-20 lg:mb-24">
            <div className="mx-auto w-full max-w-4xl text-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 md:mb-6 py-3
                             bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent
                             drop-shadow-2xl">
                {t("blog.heading")}
              </h2>
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light">{t("blog.description")}</p>
            </div>
          </div>

          {localStorage.getItem("token") && (
            <div className="mb-8 flex justify-center">
              <button
                onClick={openAddBlogModal}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-lg
                           bg-gradient-to-br from-[#ffab1f] to-[#ff9500]
                           hover:from-[#ff9500] hover:to-[#e6850e]
                           transform transition hover:-translate-y-1
                           shadow-md hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                {t("blog.addBlog")}
              </button>
            </div>
          )}

          {loading ? (
            <p className="text-center text-white">{t("blog.loading")}</p>
          ) : blogPosts.length === 0 ? (
            <p className="text-center text-white">{t("blog.noPosts")}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-6">
                {visiblePosts.map((post, index) => renderCard(post, index, false))}
                {showAll && hiddenPosts.map((post, index) => renderCard(post, index, true))}
              </div>

              {hasMorePosts && (
                <div className="flex items-center justify-center mt-12">
                  <button
                    className="px-8 py-3 bg-white border-2 border-white text-[#294a70] rounded-lg font-semibold hover:bg-[#294a70] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? t("blog.showLess") : t("blog.viewAll")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {isAddBlogModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeAddBlogModal}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#294a70] to-[#324D6B]">
                <h3 className="text-2xl font-bold text-white">Kreiraj novi blog post</h3>
                <button onClick={closeAddBlogModal} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Naslov bloga <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#294a70] focus:border-transparent"
                        placeholder="Unesite naslov bloga"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Kategorija <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70] focus:border-transparent"
                      >
                        <option value="">Izaberite kategoriju</option>
                        <option value="Technology">Tehnologija</option>
                        <option value="Business">Biznis</option>
                        <option value="Lifestyle">Životni stil</option>
                        <option value="Education">Obrazovanje</option>
                        <option value="Career">Karijera</option>
                        <option value="Other">Ostalo</option>
                      </select>
                    </div>

                    {/* NEW: Image Upload */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Slika (upload) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#294a70] focus:border-transparent"
                      />
                      {formData.imageFile && (
                        <p className="text-sm text-gray-600 mt-2">
                          Odabrano: <span className="font-semibold">{formData.imageFile.name}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Vrijeme čitanja <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="readTime"
                        value={formData.readTime}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#294a70] focus:border-transparent"
                        placeholder="npr. 5 min čitanja"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Kratki opis <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#294a70] focus:border-transparent resize-none"
                        placeholder="Kratki opis blog posta"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Sadržaj bloga <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows={15}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#294a70] focus:border-transparent resize-vertical"
                        placeholder="Napišite sadržaj vašeg bloga ovdje..."
                      />
                    </div>
                  </form>
                </div>
              </div>

              <div className="sticky bottom-0 p-6 border-t border-gray-200 bg-gray-50 z-10">
                <button
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-white font-semibold
                             bg-gradient-to-br from-[#294a70] to-[#324D6B]
                             hover:from-[#ffab1f] hover:to-[#ff9500]
                             transform transition hover:-translate-y-1
                             shadow-md hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Objavi blog
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {isModalOpen && selectedPost && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">{t("blog.modal.title")}</h3>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-200px)] pb-20">
                <div className="p-6">
                  <img
                    src={selectedPost.image.src}
                    alt={selectedPost.image.alt}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />

                  <div className="inline-block bg-[#294a70] text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    {selectedPost.category}
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {selectedPost.title}
                  </h1>

                  <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
                    <img
                      src={selectedPost.avatar.src}
                      alt={selectedPost.avatar.alt}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{selectedPost.fullName}</div>
                      <div className="text-gray-600 text-sm">
                        {selectedPost.date} • {selectedPost.readTime}
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-lg max-w-none">
                    <div
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedPost.content || selectedPost.description }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-white">
                <div className="flex justify-center">
                  <button
                    onClick={closeModal}
                    className="px-8 py-3 bg-[#294a70] text-white rounded-lg hover:bg-[#1f3854] transition-colors font-semibold text-lg shadow-lg"
                  >
                    {t("blog.modal.close")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export const BlogDefaults: Props = {
  tagline: "Blog",
  heading: "Kratki naslov ide ovdje",
  description: "Ovo je opis blog sekcije na crnogorskom jeziku.",
  button: { title: "Prikaži sve", variant: "secondary" },
  blogPosts: [],
};

export default Blog;
