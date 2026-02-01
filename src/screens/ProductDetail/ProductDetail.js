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
    TextInput,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    FadeInRight
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
                                    <SpecCard key={index} spec={spec} index={index} />
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

// Sub-Components
const FloatingHeader = ({ navigation, cartCount, viewMode, toggleViewMode, isDarkMode = true, isFavorite, onFavoritePress }) => {
    // Dynamic colors for light/dark mode visibility
    const iconColor = isDarkMode ? COLORS.white : COLORS.primary;
    const iconBg = isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.95)';
    const iconBorder = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';

    return (
        <SafeAreaView style={styles.floatingHeader} edges={['top']}>
            <TouchableOpacity
                style={[styles.glassIcon, { backgroundColor: iconBg, borderColor: iconBorder }]}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
                {/* Favorites Button */}
                <TouchableOpacity
                    style={[styles.glassIcon, {
                        backgroundColor: isFavorite ? COLORS.cta : iconBg,
                        borderColor: isFavorite ? COLORS.cta : iconBorder
                    }]}
                    onPress={onFavoritePress}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={22}
                        color={isFavorite ? COLORS.white : iconColor}
                    />
                </TouchableOpacity>

                {/* View Mode Toggle */}
                <TouchableOpacity
                    style={[styles.glassIcon, { backgroundColor: iconBg, borderColor: iconBorder }]}
                    onPress={toggleViewMode}
                >
                    <Ionicons name={viewMode === '3D' ? "images-outline" : "cube-outline"} size={22} color={iconColor} />
                </TouchableOpacity>

                {/* Cart Button */}
                <TouchableOpacity
                    style={[styles.glassIcon, { backgroundColor: iconBg, borderColor: iconBorder }]}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
                >
                    <Ionicons name="bag-handle-outline" size={22} color={iconColor} />
                    {cartCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const SpecCard = ({ spec, index }) => (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
        <GlassCard style={styles.specCard} intensity={20}>
            <Ionicons name={spec.icon} size={24} color={COLORS.cta} />
            <View>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
            </View>
        </GlassCard>
    </Animated.View>
);

const ReviewInput = ({ rating, comment, setRating, setComment, onSubmit, isLoading }) => (
    <View style={styles.reviewInputBox}>
        <Text style={styles.writeTitle}>Write a Review</Text>
        <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                    <Ionicons name={s <= rating ? "star" : "star-outline"} size={24} color={COLORS.cta} />
                </TouchableOpacity>
            ))}
        </View>
        <TextInput
            style={styles.textInput}
            placeholder="Your thoughts..."
            placeholderTextColor={COLORS.secondary}
            multiline
            value={comment}
            onChangeText={setComment}
        />
        <NeoButton title="Post Review" onPress={onSubmit} variant="secondary" style={{ marginTop: 12 }} />
    </View>
);

const ReviewsList = ({ reviews }) => {
    if (!reviews.length) return <Text style={{ color: COLORS.textLight, marginTop: 10, fontFamily: FONTS.body }}>No reviews yet.</Text>;
    return reviews.map((r, i) => (
        <View key={i} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{r.userName}</Text>
                <View style={{ flexDirection: 'row' }}>
                    {[...Array(5)].map((_, k) => (
                        <Ionicons key={k} name={k < r.rating ? "star" : "star-outline"} size={12} color={COLORS.cta} />
                    ))}
                </View>
            </View>
            <Text style={styles.reviewText}>{r.comment}</Text>
        </View>
    ));
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    bgLayer: { ...StyleSheet.absoluteFillObject, zIndex: -1, backgroundColor: COLORS.primary },

    floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12 },
    glassIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    headerRight: { flexDirection: 'row', gap: 10 },
    badge: { position: 'absolute', top: -2, right: -2, backgroundColor: COLORS.cta, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    badgeText: { color: COLORS.white, fontSize: 9, fontWeight: 'bold' },

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
    specCard: { width: 140, padding: 16, gap: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
    specLabel: { fontSize: 10, fontFamily: FONTS.bold, textTransform: 'uppercase', color: COLORS.secondary },
    specValue: { fontSize: 14, fontFamily: FONTS.body, fontWeight: '600', color: COLORS.white },

    actionSection: { flexDirection: 'row', alignItems: 'flex-end', gap: 16, marginBottom: 40 },
    qtyBox: { alignItems: 'center', gap: 8 },
    qtyLabel: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textLight },
    addToCartBtn: { flex: 1 },

    reviewsSection: { marginBottom: 40 },
    reviewInputBox: { padding: 20, borderRadius: 20, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
    writeTitle: { fontFamily: FONTS.bold, marginBottom: 12, color: COLORS.textLight },
    starRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    textInput: { borderRadius: 12, padding: 12, minHeight: 80, textAlignVertical: 'top', fontFamily: FONTS.body, marginBottom: 12, backgroundColor: 'rgba(0,0,0,0.2)', color: COLORS.white },

    loginPrompt: { padding: 20, borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, alignItems: 'center', marginBottom: 20, borderColor: COLORS.secondary },

    reviewItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    reviewUser: { fontFamily: FONTS.bold, color: COLORS.white },
    reviewText: { fontFamily: FONTS.body, lineHeight: 22, color: COLORS.textLight },

    relatedSection: { marginBottom: 60 },
});

export default ProductDetail;
