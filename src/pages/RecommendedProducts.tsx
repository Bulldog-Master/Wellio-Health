import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Edit, Trash2, ExternalLink, Award, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';

interface RecommendedProduct {
  id: string;
  name: string;
  name_es: string | null;
  description: string | null;
  description_es: string | null;
  personal_endorsement: string | null;
  personal_endorsement_es: string | null;
  category: string;
  image_url: string | null;
  purchase_url: string | null;
  price_range: string | null;
  is_bulldogz_approved: boolean;
  is_active: boolean;
  display_order: number;
}

const CATEGORIES = ['supplements', 'gear', 'apparel', 'equipment', 'recovery', 'nutrition', 'accessories'];

export default function RecommendedProducts() {
  const { t, i18n } = useTranslation(['products', 'common']);
  const navigate = useNavigate();
  const { isAdmin } = useAdminStatus();
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<RecommendedProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_es: '',
    description: '',
    description_es: '',
    personal_endorsement: '',
    personal_endorsement_es: '',
    category: 'supplements',
    image_url: '',
    purchase_url: '',
    price_range: '',
    is_bulldogz_approved: true,
    is_active: true,
    display_order: 0,
  });

  const isSpanish = i18n.language?.startsWith('es');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('recommended_products')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('recommended_products')
          .update(formData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success(t('admin.product_updated'));
      } else {
        const { error } = await supabase
          .from('recommended_products')
          .insert([formData]);

        if (error) throw error;
        toast.success(t('admin.product_added'));
      }

      setDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(t('common:error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirm_delete'))) return;

    try {
      const { error } = await supabase
        .from('recommended_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(t('admin.product_deleted'));
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(t('common:error'));
    }
  };

  const handleEdit = (product: RecommendedProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_es: product.name_es || '',
      description: product.description || '',
      description_es: product.description_es || '',
      personal_endorsement: product.personal_endorsement || '',
      personal_endorsement_es: product.personal_endorsement_es || '',
      category: product.category,
      image_url: product.image_url || '',
      purchase_url: product.purchase_url || '',
      price_range: product.price_range || '',
      is_bulldogz_approved: product.is_bulldogz_approved,
      is_active: product.is_active,
      display_order: product.display_order,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_es: '',
      description: '',
      description_es: '',
      personal_endorsement: '',
      personal_endorsement_es: '',
      category: 'supplements',
      image_url: '',
      purchase_url: '',
      price_range: '',
      is_bulldogz_approved: true,
      is_active: true,
      display_order: 0,
    });
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p => 
    selectedCategory === 'all' || p.category === selectedCategory
  );

  const getLocalizedField = (product: RecommendedProduct, field: 'name' | 'description' | 'personal_endorsement') => {
    if (isSpanish) {
      const esField = `${field}_es` as keyof RecommendedProduct;
      return (product[esField] as string) || product[field];
    }
    return product[field];
  };

  return (
    <>
      <SEOHead titleKey="products.title" descriptionKey="products.description" namespace="seo" />
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
              </div>
            </div>

            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.add_product')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? t('admin.edit_product') : t('admin.add_product')}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('admin.product_name')}</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin.product_name_es')}</Label>
                        <Input
                          value={formData.name_es}
                          onChange={(e) => setFormData({ ...formData, name_es: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('admin.description')}</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin.description_es')}</Label>
                        <Textarea
                          value={formData.description_es}
                          onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('admin.endorsement')}</Label>
                        <Textarea
                          value={formData.personal_endorsement}
                          onChange={(e) => setFormData({ ...formData, personal_endorsement: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin.endorsement_es')}</Label>
                        <Textarea
                          value={formData.personal_endorsement_es}
                          onChange={(e) => setFormData({ ...formData, personal_endorsement_es: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('admin.category')}</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {t(`categories.${cat}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin.price_range')}</Label>
                        <Input
                          value={formData.price_range}
                          onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                          placeholder="$20-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('admin.image_url')}</Label>
                      <Input
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('admin.purchase_url')}</Label>
                      <Input
                        value={formData.purchase_url}
                        onChange={(e) => setFormData({ ...formData, purchase_url: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('admin.display_order')}</Label>
                      <Input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_bulldogz_approved}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_bulldogz_approved: checked })}
                        />
                        <Label>{t('admin.is_approved')}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label>{t('admin.is_active')}</Label>
                      </div>
                    </div>

                    <Button onClick={handleSave} className="w-full">
                      {editingProduct ? t('common:save') : t('admin.add_product')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="all">{t('categories.all')}</TabsTrigger>
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {t(`categories.${cat}`)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-muted rounded-t-lg" />
                      <CardContent className="p-4 space-y-3">
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <Card className="p-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {selectedCategory === 'all' ? t('no_products') : t('no_products_category')}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden group">
                      {product.image_url ? (
                        <div className="relative h-48 bg-muted">
                          <img
                            src={product.image_url}
                            alt={getLocalizedField(product, 'name') || ''}
                            className="w-full h-full object-cover"
                          />
                          {product.is_bulldogz_approved && (
                            <Badge className="absolute top-2 right-2 bg-primary">
                              <Award className="h-3 w-3 mr-1" />
                              {t('bulldogz_approved')}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Package className="h-16 w-16 text-primary/40" />
                          {product.is_bulldogz_approved && (
                            <Badge className="absolute top-2 right-2 bg-primary">
                              <Award className="h-3 w-3 mr-1" />
                              {t('bulldogz_approved')}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {getLocalizedField(product, 'name')}
                            </h3>
                            <Badge variant="secondary" className="mt-1">
                              {t(`categories.${product.category}`)}
                            </Badge>
                          </div>
                          {product.price_range && (
                            <span className="text-sm font-medium text-muted-foreground">
                              {product.price_range}
                            </span>
                          )}
                        </div>

                        {getLocalizedField(product, 'description') && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {getLocalizedField(product, 'description')}
                          </p>
                        )}

                        {getLocalizedField(product, 'personal_endorsement') && (
                          <div className="bg-primary/5 rounded-lg p-3 border-l-4 border-primary">
                            <p className="text-xs font-medium text-primary mb-1">{t('why_i_recommend')}</p>
                            <p className="text-sm italic">
                              "{getLocalizedField(product, 'personal_endorsement')}"
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                          {product.purchase_url && (
                            <Button asChild className="flex-1">
                              <a href={product.purchase_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                {t('visit_store')}
                              </a>
                            </Button>
                          )}

                          {isAdmin && (
                            <>
                              <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDelete(product.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
