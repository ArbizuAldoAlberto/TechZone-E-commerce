/**
 * @fileoverview Product Detail View (TechZone Elite)
 * @module screens/ProductDetail
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';

import { addItem } from '../../store/cartSlice';
import { toggleFavorite } from '../../store/favoritesSlice';
import { useGetReviewsQuery, usePostReviewMutation, useGetProductsQuery } from '../../services/shopService';
import { COLORS, FONTS, SPACING } from '../../theme';
import { useCustomAlert } from '../../components/common/CustomAlert';
import CustomAlert from '../../components/common/CustomAlert';

import Product3DViewer from '../../components/3d/Product3DViewer';
import ParticlesBackground from '../../components/3d/ParticlesBackground';
import ImageGallery from '../../components/product/ImageGallery';
import QuantitySelector from '../../components/common/QuantitySelector';
import ProductRow from '../../components/home/ProductRow';
import { NeoButton } from '../../components/ui/NeoButton';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientText } from '../../components/ui/GradientText';

// Extracted Components
import { FloatingHeader } from '../../components/product/FloatingHeader';
import { ProductSpecs } from '../../components/product/ProductSpecs';
import { ReviewInput, ReviewsList } from '../../components/product/ProductReviews';

const IMG_HEIGHT = 450;

const ProductDetail = ({ route, navigation }) => {
    const { product = {} } = route.params || {};
    const dispatch = useDispatch();
    const { alertConfig, showAlert, hideAlert } = useCustomAlert();

    // Selectors
    const { user, localId } = useSelector(state => state.auth);
    const cartCount = useSelector(state => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
    const isDarkMode = useSelector(state => state.theme.isDarkMode);
    const favorites = useSelector(state => state.favorites.items);
    const isFavorite = favorites.some(item => item.id === product.id);

    const handleToggleFavorite = () => {
        dispatch(toggleFavorite(product));
    };

    // State
    const [viewMode, setViewMode] = useState('3D');
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [quantity, setQuantity] = useState(1);

    const isLoggedIn = !!(user || localId);

    // Anim
    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler(event => {
        scrollY.value = event.contentOffset.y;
    });

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(scrollY.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75], Extrapolation.CLAMP) },
            { scale: interpolate(scrollY.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [2, 1, 1], Extrapolation.CLAMP) },
        ],
        opacity: interpolate(scrollY.value, [0, IMG_HEIGHT / 2], [1, 0], Extrapolation.CLAMP)
    }));

    // Data
    const { data: productReviews = [], isLoading: isLoadingReviews } = useGetReviewsQuery(product.id);
    const { data: allProducts } = useGetProductsQuery();
    const [triggerPostReview, { isLoading: isPostingReview }] = usePostReviewMutation();

    const avgRating = useMemo(() => {
        if (!productReviews.length) return product.rating || 0;
        return productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    }, [productReviews, product.rating]);

    const relatedProducts = useMemo(() => {
        if (!allProducts) return [];
        const list = Array.isArray(allProducts) ? allProducts : Object.values(allProducts);
        return list.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);
    }, [allProducts, product]);

    const productSpecs = useMemo(() => {
        if (product.specs?.length) return product.specs;
        return [
            { label: 'Brand', value: product.brand || 'TechZone', icon: 'ribbon-outline' },
            { label: 'Category', value: product.category || 'Tech', icon: 'grid-outline' },
            { label: 'Stock', value: `${product.stock || 10} units`, icon: 'cube-outline' }
        ];
    }, [product]);

    const handleAddToCart = () => {
        dispatch(addItem({ ...product, quantity }));
        showAlert('Added', `${quantity} item(s) to cart`, [{ text: 'OK' }], 'checkmark');
    };

    const handlePostReview = async () => {
        if (!userRating || !userComment.trim()) return;
        try {
            await triggerPostReview({
                productId: product.id,
                rating: userRating,
                comment: userComment,
                userName: user || 'User',
                userId: localId
            }).unwrap();
            setUserComment('');
            setUserRating(0);
            showAlert('Thank You', 'Review submitted', [{ text: 'OK' }]);
        } catch {
            showAlert('Error', 'Failed to post review', [{ text: 'OK' }]);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Background Layer */}
            <View style={styles.bgLayer}>
                <ParticlesBackground />
            </View>

            <CustomAlert {...alertConfig} onClose={hideAlert} />

            <FloatingHeader
                navigation={navigation}
                cartCount={cartCount}
                viewMode={viewMode}
                toggleViewMode={() => setViewMode(m => m === '3D' ? '2D' : '3D')}
                isDarkMode={isDarkMode}
                isFavorite={isFavorite}
                onFavoritePress={handleToggleFavorite}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <Animated.ScrollView
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <View style={styles.heroContainer}>
                        <Animated.View style={[styles.parallaxHeader, headerAnimatedStyle]}>
                            {viewMode === '3D' ? <Product3DViewer /> : <ImageGallery images={product.images || [product.image]} height={IMG_HEIGHT} />}
                        </Animated.View>
                    </View>

                    {/* Content Sheet */}
                    <GlassCard style={styles.contentSheet} intensity={95}>
                        <View style={styles.handleBar} />

                        <View style={styles.headerMeta}>
                            <Text style={styles.categoryLabel}>{product.category || 'PREMIUM'}</Text>
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={14} color={COLORS.white} />
                                <Text style={styles.ratingScore}>{avgRating.toFixed(1)}</Text>
                            </View>
                        </View>

                        <GradientText style={styles.title}>{product.title}</GradientText>
                        <Text style={styles.price}>${product.price.toLocaleString()}</Text>

                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{product.description}</Text>

                        {/* Specs */}
                        <View style={styles.specsSection}>
                            <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specsScroll}>
                                {productSpecs.map((spec, index) => (
                                    <ProductSpecs key={index} spec={spec} index={index} />
                                ))}
                            </Animated.ScrollView>
                        </View>

                        {/* Action Bar */}
                        <View style={styles.actionSection}>
                            <View style={styles.qtyBox}>
                                <Text style={styles.qtyLabel}>Qty</Text>
                                <QuantitySelector
                                    quantity={quantity}
                                    onIncrement={() => setQuantity(q => q + 1)}
                                    onDecrement={() => setQuantity(q => Math.max(1, q - 1))}
                                    isDarkMode={true}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <NeoButton
                                    title="Add to Cart"
                                    onPress={handleAddToCart}
                                    style={styles.addToCartBtn}
                                />
                            </View>
                        </View>

                        {/* Reviews */}
                        <View style={styles.reviewsSection}>
                            <Text style={styles.sectionTitle}>Reviews ({productReviews.length})</Text>
                            {isLoggedIn ? (
                                <ReviewInput
                                    rating={userRating} comment={userComment}
                                    setRating={setUserRating} setComment={setUserComment}
                                    onSubmit={handlePostReview} isLoading={isPostingReview}
                                />
                            ) : (
                                <TouchableOpacity onPress={() => navigation.navigate('Auth')} style={styles.loginPrompt}>
                                    <Text style={{ color: COLORS.cta, fontFamily: FONTS.body, fontWeight: '600' }}>Log in to review</Text>
                                </TouchableOpacity>
                            )}
                            <ReviewsList reviews={productReviews} />
                        </View>

                        {/* Related */}
                        {relatedProducts.length > 0 && (
                            <View style={styles.relatedSection}>
                                <ProductRow title="More Like This" products={relatedProducts} navigation={navigation} isDarkMode={true} />
                            </View>
                        )}
                    </GlassCard>
                </Animated.ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    bgLayer: { ...StyleSheet.absoluteFillObject, zIndex: -1, backgroundColor: COLORS.primary },

    heroContainer: { height: IMG_HEIGHT, overflow: 'hidden' },
    parallaxHeader: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },

    contentSheet: {
        flex: 1,
        marginTop: -40,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 16,
        minHeight: 800,
        backgroundColor: COLORS.glassBg, // Fallback if blur fails, but GlassCard handles it
        overflow: 'hidden'
    },
    handleBar: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },

    headerMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    categoryLabel: { fontSize: 12, fontFamily: FONTS.heading, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: COLORS.cta },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cta, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
    ratingScore: { color: COLORS.white, fontSize: 12, fontFamily: FONTS.bold },

    title: { fontSize: 32, lineHeight: 36, marginBottom: 8, letterSpacing: -0.5 },
    price: { fontSize: 24, fontFamily: FONTS.bold, marginBottom: 24, color: COLORS.white },

    sectionTitle: { fontSize: 18, fontFamily: FONTS.heading, fontWeight: '700', marginBottom: 12, marginTop: 8, color: COLORS.textLight },
    description: { fontSize: 16, fontFamily: FONTS.body, lineHeight: 24, marginBottom: 32, color: COLORS.textLight },

    specsSection: { marginBottom: 32 },
    specsScroll: { gap: 12, paddingRight: 20 },

    actionSection: { flexDirection: 'row', alignItems: 'flex-end', gap: 16, marginBottom: 40 },
    qtyBox: { alignItems: 'center', gap: 8 },
    qtyLabel: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textLight },
    addToCartBtn: { flex: 1 },

    reviewsSection: { marginBottom: 40 },
    loginPrompt: { padding: 20, borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, alignItems: 'center', marginBottom: 20, borderColor: COLORS.secondary },

    relatedSection: { marginBottom: 60 },
});

export default ProductDetail;
