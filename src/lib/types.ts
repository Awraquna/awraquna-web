export type Locale = "en" | "ar";

export type Settings = Record<string, string | null | undefined>;

export type Banner = {
  id: number;
  titleEn: string | null;
  titleAr: string | null;
  subtitleEn: string | null;
  subtitleAr: string | null;
  imageUrl: string | null;
  ctaTextEn: string | null;
  ctaTextAr: string | null;
  ctaUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type SubCategory = {
  id: number;
  categoryId: number;
  nameEn: string;
  nameAr: string | null;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  categoryNameEn?: string | null;
};

export type Category = {
  id: number;
  nameEn: string;
  nameAr: string | null;
  slug: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  imageUrl: string | null;
  showOnHome: boolean;
  sortOrder: number;
  isActive: boolean;
  subCategories?: SubCategory[];
  productCount?: number;
};

export type BusinessArea = {
  id: number;
  nameEn: string;
  nameAr: string | null;
  slug: string;
  taglineEn: string | null;
  taglineAr: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type ProductCard = {
  id: number;
  sku: string | null;
  nameEn: string;
  nameAr: string | null;
  slug: string;
  shortDescEn: string | null;
  shortDescAr: string | null;
  price: number | null;
  unit: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: number | null;
  categoryNameEn: string | null;
  categoryNameAr: string | null;
  categorySlug: string | null;
  subCategoryId: number | null;
  subCategoryNameEn: string | null;
  subCategoryNameAr: string | null;
  subCategorySlug: string | null;
  businessAreaSlugs: string[];
};

export type ProductImage = { id: number; imageUrl: string; sortOrder: number };

export type ProductSpec = {
  id: number;
  labelEn: string;
  labelAr: string | null;
  valueEn: string;
  valueAr: string | null;
  sortOrder: number;
};

export type ProductDetail = ProductCard & {
  descriptionEn: string | null;
  descriptionAr: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
  images: ProductImage[];
  specs: ProductSpec[];
  businessAreas: BusinessArea[];
  related: ProductCard[];
};

export type NewsCard = {
  id: number;
  titleEn: string;
  titleAr: string | null;
  slug: string;
  tagEn: string | null;
  tagAr: string | null;
  excerptEn: string | null;
  excerptAr: string | null;
  coverImageUrl: string | null;
  readMinutes: number | null;
  publishedAt: string | null;
  isPublished: boolean;
};

export type NewsDetail = NewsCard & {
  bodyEn: string | null;
  bodyAr: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type ContentItem = {
  id: number;
  sectionId: number;
  titleEn: string | null;
  titleAr: string | null;
  textEn: string | null;
  textAr: string | null;
  icon: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type ContentSection = {
  id: number;
  pageKey: string;
  sectionKey: string;
  titleEn: string | null;
  titleAr: string | null;
  subtitleEn: string | null;
  subtitleAr: string | null;
  bodyEn: string | null;
  bodyAr: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  items: ContentItem[];
};

export type Client = {
  id: number;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };

export type HomeData = {
  settings: Settings;
  banners: Banner[];
  categories: Category[];
  businessAreas: BusinessArea[];
  featuredProducts: ProductCard[];
  sections: ContentSection[];
  clients: Client[];
  latestNews: NewsCard[];
};

export type ContactPayload = {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  subject: string;
  message: string;
};
