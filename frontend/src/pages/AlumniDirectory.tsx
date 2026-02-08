import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

type ImageProps = {
  src: string;
  alt?: string;
};

type ButtonProps = {
  title?: string;
  variant?: "primary" | "secondary" | "link";
  size?: "sm" | "md" | "lg";
};

type Footer = {
  heading: string;
  description: string;
  button: ButtonProps;
};

type SocialLink = {
  href: string;
  icon: React.ReactNode;
};

type AlumniMember = {
  id: number;
  image: ImageProps;
  name: string;
  jobTitle: string;
  description: string;
  socialLinks: SocialLink[];
  isPublic: boolean;
};

type Props = {
  tagline: string;
  heading: string;
  description: string;
  alumniMembers: AlumniMember[];
  footer: Footer;
};

export type AlumniDirectoryProps = React.ComponentPropsWithoutRef<"section"> &
  Partial<Props>;

const Button: React.FC<
  ButtonProps & {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit";
  }
> = ({
  title,
  variant = "primary",
  size = "md",
  children,
  onClick,
  className = "",
  type = "button",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: "bg-[#ffab1f] text-white hover:bg-[#ff9500] focus:ring-[#ffab1f]",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    link: "text-blue-600 hover:text-blue-700 underline",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children || title}
    </button>
  );
};

const AlumniMemberCard = ({ member }: { member: AlumniMember }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!member.isPublic) {
      return;
    }
    navigate(`/alumni/${member.id}`);
  };

  return (
    <div
      className="flex flex-col text-center cursor-pointer hover:scale-[1.02] transition"
      onClick={handleClick}
    >
      <div className="rb-5 mb-5 flex w-full items-center justify-center md:mb-6">
        <img
          src={member.image.src}
          alt={member.image.alt}
          className="size-20 min-h-20 min-w-20 rounded-full object-cover"
        />
      </div>
      <div className="mb-3 md:mb-4">
        <h5 className="text-md font-semibold md:text-lg text-white">{member.name}</h5>
        <h6 className="md:text-md text-white">{member.jobTitle}</h6>
      </div>
      {member.description && (
        <p className="text-white text-sm opacity-90 break-all">{member.description}</p>
      )}
      <div className="mt-6 grid grid-flow-col grid-cols-[max-content] gap-3.5 self-center">
        {member.socialLinks.map((link: SocialLink, index: number) => (
          <a key={index} href={link.href}>
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  );
};

export const AlumniDirectory = (props: AlumniDirectoryProps) => {
  const { tagline, heading, description, footer } = {
    ...AlumniDirectoryDefaults,
    ...props,
  };

  const [showPrivatePopup, setShowPrivatePopup] = useState(false);


  // REAL alumni loaded from backend
  const [alumniMembers, setAlumniMembers] = useState<AlumniMember[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);

  // ENROLL modal state (original behaviour)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false); // submit loading for enroll
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // Load real alumni from backend
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get("/alumni/directory");
        const backendUsers = res.data.users;

        const API_BASE_URL = "http://localhost:4000";

        const mapped: AlumniMember[] = backendUsers.map((u: any) => ({
          id: u.id,
          image: {
          src: u.profile_picture ? `${API_BASE_URL}${u.profile_picture}?t=${Date.now()}`
          : "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
        },
          name: `${u.first_name} ${u.last_name}`,
          jobTitle: u.occupation || "Nije navedeno",
          description: u.email || "", // Email umjesto praznog opisa
          socialLinks: [],
          isPublic: u.is_public,
       }));

          setAlumniMembers(mapped);
        } catch (err) {
          console.error("Greška pri učitavanju direktorijuma:", err);
        } finally {
          setDirectoryLoading(false);
        }
      };

    loadUsers();

    // Osvježi podatke kada se korisnik vrati na stranicu
    const handleFocus = () => {
      loadUsers();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Ime i prezime je obavezno";
    if (!formData.email.trim()) newErrors.email = "Email je obavezan";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Nevažeći email";
    if (!formData.message.trim()) newErrors.message = "Poruka je obavezna";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validateForm()) return;

    try {
      setLoading(true);
      await api.post("/enroll", {
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });

      setSubmitSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setIsModalOpen(false);
      alert("Prijava je uspješno poslata.");
    } catch (error) {
      console.error("Greška pri slanju prijave:", error);
      setSubmitError(
        "Došlo je do greške pri slanju prijave. Pokušajte ponovo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  if (directoryLoading) {
    return (
      <section className="px-[5%] py-16 md:py-24 lg:py-28 bg-[#294a70] min-h-screen">
        <div className="text-center text-white">Učitavanje...</div>
      </section>
    );
  }

  return (
  <>
    <style>{`
      @keyframes fadeIn {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }

      @keyframes slideUp {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes scaleIn {
        0% {
          opacity: 0;
          transform: scale(0.9);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      .animate-fade-in {
        animation: fadeIn 0.6s ease-out forwards;
      }

      .animate-slide-up {
        animation: slideUp 0.6s ease-out forwards;
      }

      .animate-scale-in {
        animation: scaleIn 0.6s ease-out forwards;
      }
    `}</style>

    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28 bg-[#294a70] min-h-screen">
      <div className="container">
        <div className="mx-auto mb-12 max-w-4xl text-center md:mb-18 lg:mb-20 animate-fade-in opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 md:mb-6 py-3
                         bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent
                         drop-shadow-2xl">
            {heading}
          </h2>
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light">{description}</p>
        </div>

        <div className="grid grid-cols-1 items-start justify-center gap-x-8 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
          {alumniMembers.map((member: AlumniMember, index: number) => (
        <div
          key={index}
          className="animate-slide-up opacity-0"
          style={{
            animationDelay: `${600 + index * 150}ms`,
            animationFillMode: 'forwards'
          }}
          onClick={() => {
          if (!member.isPublic) {
            setShowPrivatePopup(true);
          }
          }}
        >
    <AlumniMemberCard member={member} />
  </div>
))}

        </div>

        {!isLoggedIn && (
          <div className="mx-auto mt-14 w-full max-w-md text-center md:mt-20 lg:mt-24 animate-scale-in opacity-0" style={{ animationDelay: '1200ms', animationFillMode: 'forwards' }}>
            <h4 className="mb-3 text-3xl font-bold md:mb-4 md:text-4xl md:leading-[1.3] lg:text-5xl text-white">
              {footer.heading}
            </h4>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light">{footer.description}</p>
            <div className="mt-6 flex items-center justify-center gap-x-4 textcenter md:mt-8">
              <Button {...footer.button} onClick={() => setIsModalOpen(true)}>
                {footer.button.title}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>

    {isModalOpen && (
      <>
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsModalOpen(false)}
          aria-hidden="true"
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Pridružite se Alumni klubu
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ime i prezime *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Poruka *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.message}
                    </p>
                  )}
                </div>

                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}
                {submitSuccess && (
                  <p className="text-sm text-green-600">
                    Prijava je uspješno poslata.
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Otkaži
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="flex-1"
                  >
                    {loading ? "Slanje..." : "Pošaljite prijavu"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    )}

    {showPrivatePopup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl p-6 shadow-xl text-center w-[320px]">
          <h3 className="text-lg font-bold mb-2 text-[#294a70]">
            Privatni profil
          </h3>
          <p className="text-gray-600 mb-4">
            Ovaj profil je privatan i nije dostupan za pregled.
          </p>
          <button
            onClick={() => setShowPrivatePopup(false)}
            className="px-5 py-2 bg-[#294a70] text-white rounded-lg hover:bg-[#1f3854]"
          >
            U redu
          </button>
        </div>
      </div>
    )}
  </>
);


  
  
};

export const AlumniDirectoryDefaults: Props = {
  tagline: "Mediteran FIT",
  heading: "Naša mreža uspjeha",
  description:
    "Upoznajte naše bivše studente koji grade uspješne karijere širom svijeta. Pridružite se zajednici koja povezuje, inspirira i podrška.",
  alumniMembers: [], 
  footer: {
    heading: "Postanite dio naše priče!",
    description: "Pošaljite prijavu i budite dio naše mreže bivših studenata.",
    button: { title: "Prijavite se", variant: "primary", size: "lg" },
  },
};

export default AlumniDirectory;