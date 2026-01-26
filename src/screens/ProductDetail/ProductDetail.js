/**
 * @fileoverview Product Detail Screen
 * @description Displays full product information including images, price, description, and reviews.
 * Features:
 * - Image carousel with pagination
 * - Add to cart functionality
 * - Toggle favorite status
 * - Review system with star rating and comments (Backend integrated)
 * - Sharing functionality
 */
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    FlatList,
    TextInput,
    Share,
    Platform,
    useWindowDimensions,
    ActivityIndicator
} from 'react-native';
import { colors, getColors } from '../../global/colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../../store/cartSlice';
import { toggleFavorite } from '../../store/favoritesSlice';
import CustomAlert, { useCustomAlert } from '../../components/common/CustomAlert';

// Backend Services
import { useGetReviewsQuery, usePostReviewMutation } from '../../services/shopService';

const ProductDetail = ({ route, navigation }) => {
    const { width } = useWindowDimensions();
    const product = route.params?.product || {
        id: 0,
        title: 'Unknown Product',
        description: 'No description available',
        price: 0,
        image: 'https://via.placeholder.com/300',
        images: [],
        rating: 0,
        reviews: 0,
    };

    const productImages = product.images?.length > 0
        ? product.images
        : [product.image, product.image, product.image];

    const dispatch = useDispatch();
    const favorites = useSelector(state => state.favorites.items);
    const isDarkMode = useSelector(state => state.theme.isDarkMode);
    const { user, localId } = useSelector(state => state.auth);
    const cartItems = useSelector(state => state.cart.items);

    // Backend Logic
    const { data: productReviews = [], isLoading: isLoadingReviews, isError } = useGetReviewsQuery(product.id, {
        refetchOnMountOrArgChange: true
    });
    const [triggerPostReview, { isLoading: isPostingReview }] = usePostReviewMutation();

    const isFavorite = favorites.some(fav => fav.id === product.id);
    const isLoggedIn = !!user || !!localId;
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const themeColors = getColors(isDarkMode);
    const { alertConfig, showAlert, hideAlert } = useCustomAlert();

    // State for reviews
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const flatListRef = useRef(null);

    // Calculate average rating including dynamic backend reviews
    // Note: product.rating is the static initial rating, we mix it or prefer dynamic
    const allReviewsCount = productReviews.length;
    const avgRating = productReviews.length > 0
        ? productReviews.reduce((sum, r) => sum + r.rating, 0) / allReviewsCount
        : product.rating || 0; // Fallback to seed data if no real reviews

    const handleToggleFavorite = () => {
        dispatch(toggleFavorite(product));
    };

    const handleAddToCart = () => {
        dispatch(addItem({ ...product, quantity: 1 }));
        showAlert(
            'Agregado al Carrito',
            `${product.title} se agregó correctamente`,
            [
                { text: 'Ver Carrito', onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }) },
                { text: 'Continuar', style: 'cancel' }
            ],
            'cart-outline'
        );
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `¡Mira este producto! ${product.title} - $${product.price}\n\nDisponible en TechZone`,
                title: product.title,
            });
        } catch {
            showAlert('Error', 'No se pudo compartir el producto', [{ text: 'OK' }], 'alert-circle-outline');
        }
    };

    const handleSubmitReview = async () => {
        if (!isLoggedIn) {
            showAlert(
                'Iniciar Sesión Requerido',
                'Debes iniciar sesión para dejar una reseña',
                [
                    { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Auth') },
                    { text: 'Cancelar', style: 'cancel' }
                ],
                'person-outline'
            );
            return;
        }

        if (userRating === 0) {
            showAlert('Calificación Requerida', 'Por favor selecciona una calificación con estrellas', [{ text: 'OK' }], 'star-outline');
            return;
        }

        if (userComment.trim().length < 10) {
            showAlert('Comentario muy corto', 'Por favor escribe un comentario de al menos 10 caracteres', [{ text: 'OK' }], 'chatbubble-outline');
            return;
        }

        try {
            await triggerPostReview({
                productId: product.id,
                rating: userRating,
                comment: userComment,
                userEmail: user || 'Usuario',
                userId: localId,
            }).unwrap();

            setUserRating(0);
            setUserComment('');
            showAlert('¡Gracias!', 'Tu reseña ha sido publicada', [{ text: 'OK' }], 'checkmark-circle-outline');
        } catch (error) {
            showAlert('Error', 'No se pudo publicar tu reseña. Intenta de nuevo.', [{ text: 'OK' }], 'alert-circle-outline');
        }
    };

    const handleImageScroll = (event) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentImageIndex(slideIndex);
    };

    const renderStarSelector = () => (
        <View style={styles.starSelector}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => {
                        if (isLoggedIn) {
                            setUserRating(star);
                        } else {
                            showAlert(
                                'Iniciar Sesión',
                                'Debes iniciar sesión para calificar',
                                [
                                    { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Auth') },
                                    { text: 'Cancelar', style: 'cancel' }
                                ],
                                'person-outline'
                            );
                        }
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={star <= userRating ? 'star' : 'star-outline'}
                        size={32}
                        color={star <= userRating ? '#FFD700' : themeColors.textLight}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderReviewItem = ({ item }) => (
        <View style={[styles.reviewItem, isDarkMode && styles.reviewItemDark]}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewUser}>
                    <View style={styles.reviewAvatar}>
                        <Ionicons name="person" size={16} color={colors.white} />
                    </View>
                    <Text style={[styles.reviewUserName, { color: themeColors.text }]}>
                        {item.userEmail?.split('@')[0] || 'Usuario'}
                    </Text>
                </View>
                <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                            key={star}
                            name={star <= item.rating ? 'star' : 'star-outline'}
                            size={14}
                            color="#FFD700"
                        />
                    ))}
                </View>
            </View>
            <Text style={[styles.reviewComment, { color: themeColors.text }]}>{item.comment}</Text>
            <Text style={[styles.reviewDate, { color: themeColors.textLight }]}>
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Reciente'}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]} edges={['top', 'bottom']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <CustomAlert {...alertConfig} onClose={hideAlert} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Actions */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backButton, isDarkMode && styles.buttonDark]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={[styles.iconButton, isDarkMode && styles.buttonDark]}
                            onPress={handleShare}
                        >
                            <Ionicons name="share-social-outline" size={24} color={themeColors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.iconButton, isDarkMode && styles.buttonDark]}
                            onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
                        >
                            <Ionicons name="bag-outline" size={24} color={themeColors.text} />
                            {cartCount > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Product Image Carousel */}
                <View style={[styles.imageContainer, isDarkMode && styles.imageContainerDark, { width }]}>
                    <FlatList
                        ref={flatListRef}
                        data={productImages}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleImageScroll}
                        scrollEventThrottle={16}
                        renderItem={({ item }) => (
                            <View style={[styles.imageSlide, { width }]}>
                                <Image
                                    source={{ uri: item }}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            </View>
                        )}
                        keyExtractor={(item, index) => `image-${index}`}
                    />
                    {/* Pagination Dots */}
                    <View style={styles.paginator}>
                        {productImages.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === currentImageIndex && styles.activeDot,
                                    isDarkMode && index !== currentImageIndex && styles.dotDark
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={2}>
                            {product.title}
                        </Text>
                        <TouchableOpacity onPress={handleToggleFavorite}>
                            <Ionicons
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={28}
                                color={isFavorite ? colors.error : themeColors.textLight}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Rating Display */}
                    <View style={styles.ratingRow}>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Ionicons
                                key={index}
                                name={index < Math.floor(avgRating) ? "star" : "star-outline"}
                                size={16}
                                color="#FFD700"
                                style={{ marginRight: 2 }}
                            />
                        ))}
                        <Text style={[styles.ratingText, { color: themeColors.textLight }]}>
                            {avgRating.toFixed(1)} ({allReviewsCount} Reviews)
                        </Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>${(product.price || 0).toLocaleString()}</Text>
                        <Text style={[styles.oldPrice, { color: themeColors.textLight }]}>
                            ${((product.price || 0) * 1.2).toLocaleString()}
                        </Text>
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>-20%</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: themeColors.textLight }]}>Descripción</Text>
                    <Text style={[styles.description, { color: themeColors.text }]}>{product.description}</Text>

                    {/* Reviews Section */}
                    <View style={styles.reviewsSection}>
                        <Text style={[styles.sectionTitle, { color: themeColors.textLight }]}>
                            RESEÑAS Y CALIFICACIONES
                        </Text>

                        {/* Write a Review */}
                        <View style={[styles.writeReviewCard, isDarkMode && styles.writeReviewCardDark]}>
                            <Text style={[styles.writeReviewTitle, { color: themeColors.text }]}>
                                {isLoggedIn ? 'Escribe tu reseña' : 'Inicia sesión para reseñar'}
                            </Text>

                            {renderStarSelector()}

                            <TextInput
                                style={[
                                    styles.reviewInput,
                                    isDarkMode && styles.reviewInputDark,
                                    { color: themeColors.text }
                                ]}
                                placeholder="Comparte tu experiencia con este producto..."
                                placeholderTextColor={themeColors.textLight}
                                multiline
                                numberOfLines={3}
                                value={userComment}
                                onChangeText={setUserComment}
                                editable={isLoggedIn && !isPostingReview}
                            />

                            <TouchableOpacity
                                style={[styles.submitReviewButton, (!isLoggedIn || isPostingReview) && styles.submitReviewButtonDisabled]}
                                onPress={handleSubmitReview}
                                activeOpacity={0.8}
                                disabled={!isLoggedIn || isPostingReview}
                            >
                                {isPostingReview ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <>
                                        <Ionicons name="send" size={18} color={colors.white} />
                                        <Text style={styles.submitReviewText}>
                                            {isLoggedIn ? 'Publicar Reseña' : 'Iniciar Sesión'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Existing Reviews */}
                        {isLoadingReviews ? (
                            <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 24 }} />
                        ) : productReviews.length > 0 ? (
                            <View style={styles.reviewsList}>
                                <Text style={[styles.reviewsListTitle, { color: themeColors.text }]}>
                                    Reseñas recientes ({productReviews.length})
                                </Text>
                                {productReviews.map((review) => (
                                    <View key={review.id}>
                                        {renderReviewItem({ item: review })}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.noReviews}>
                                <Ionicons name="chatbubble-outline" size={40} color={themeColors.textLight} />
                                <Text style={[styles.noReviewsText, { color: themeColors.textLight }]}>
                                    Sé el primero en dejar una reseña
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.footer, isDarkMode && styles.footerDark]}>
                <View style={styles.totalContainer}>
                    <Text style={[styles.totalLabel, { color: themeColors.textLight }]}>Total Price</Text>
                    <Text style={[styles.totalPrice, { color: themeColors.text }]}>
                        ${(product.price || 0).toLocaleString()}
                    </Text>
                </View>
                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                    <Ionicons name="cart" size={20} color={colors.white} style={{ marginRight: 8 }} />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    containerDark: {
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    buttonDark: {
        backgroundColor: '#1C1C1E',
    },
    headerRight: {
        flexDirection: 'row',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        elevation: 2,
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    cartBadgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: '700',
    },
    imageContainer: {
        height: 300,
        backgroundColor: '#FDEBD0',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
        marginBottom: 20,
    },
    imageContainerDark: {
        backgroundColor: '#2C2C2E',
    },
    imageSlide: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '90%',
        height: '90%',
    },
    paginator: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: 4,
    },
    dotDark: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    activeDot: {
        backgroundColor: colors.primary,
        width: 20,
    },
    contentContainer: {
        paddingHorizontal: 24,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        flex: 1,
        marginRight: 16,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingText: {
        fontSize: 14,
        marginLeft: 8,
        fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    price: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.primary,
        marginRight: 12,
    },
    oldPrice: {
        fontSize: 18,
        textDecorationLine: 'line-through',
        marginRight: 12,
    },
    discountBadge: {
        backgroundColor: colors.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    discountText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginTop: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.8,
    },
    // Reviews Section
    reviewsSection: {
        marginTop: 24,
    },
    writeReviewCard: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 20,
        marginTop: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }
        })
    },
    writeReviewCardDark: {
        backgroundColor: '#1C1C1E',
    },
    writeReviewTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    starSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
    },
    reviewInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    reviewInputDark: {
        backgroundColor: '#2C2C2E',
    },
    submitReviewButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    submitReviewButtonDisabled: {
        backgroundColor: '#8E8E93',
    },
    submitReviewText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    reviewsList: {
        marginTop: 24,
    },
    reviewsListTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    reviewItem: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    reviewItemDark: {
        backgroundColor: '#1C1C1E',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reviewAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewUserName: {
        fontSize: 14,
        fontWeight: '600',
    },
    reviewStars: {
        flexDirection: 'row',
    },
    reviewComment: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    reviewDate: {
        fontSize: 12,
    },
    noReviews: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    noReviewsText: {
        fontSize: 14,
        marginTop: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 34,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
            }
        })
    },
    footerDark: {
        backgroundColor: '#1C1C1E',
    },
    totalContainer: {
        justifyContent: 'center',
    },
    totalLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    totalPrice: {
        fontSize: 24,
        fontWeight: '800',
    },
    addToCartButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 16,
    },
    addToCartText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
});

export default ProductDetail;
