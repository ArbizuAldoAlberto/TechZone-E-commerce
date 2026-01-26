/**
 * @fileoverview Home Screen (Shop)
 * @description Main shopping interface with categories, product grid, search, and filtering.
 * Features:
 * - Dynamic columns based on screen width
 * - Pull-to-refresh & skeleton loading
 * - Search with debounce
 * - Sorting & Filtering (Price/Rating)
 * - Favorites integration
 */
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, ImageBackground, TouchableOpacity, FlatList, StatusBar, useWindowDimensions } from 'react-native';
import { colors, getColors } from '../../global/colors';
import { Ionicons } from '@expo/vector-icons';
import ProductItem from '../../components/ProductItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetCategoriesQuery, useGetProductsQuery } from '../../services/shopService';
import { useSelector, useDispatch } from 'react-redux';
import { setCategorySelected } from '../../store/shopSlice';
import { HomeSkeleton } from '../../components/common/SkeletonLoader';
import { useDebounce } from '../../app/hooks';
import CustomAlert, { useCustomAlert } from '../../components/common/CustomAlert';

const Home = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const dispatch = useDispatch();
    const selectedCategory = useSelector(state => state.shop.selectedCategory);
    const { isOffline, pendingSyncCount } = useSelector(state => state.cart);
    const isDarkMode = useSelector(state => state.theme.isDarkMode);
    const favorites = useSelector(state => state.favorites?.items || []);
    const { user, profileImage } = useSelector(state => state.auth);
    const reviews = useSelector(state => state.reviews?.byProductId || {});

    // CustomAlert hook
    const { alertConfig, showAlert, hideAlert } = useCustomAlert();

    // Get dynamic colors based on theme
    const themeColors = getColors(isDarkMode);

    // Search state with debounce
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Sort order state: 'none' | 'price_asc' | 'price_desc' | 'rating'
    const [sortOrder, setSortOrder] = useState('none');

    const { data: categories, isLoading: loadingCategories } = useGetCategoriesQuery();
    const { data: products, isLoading: loadingProducts, isError, refetch } = useGetProductsQuery(selectedCategory);

    const numColumns = useMemo(() => {
        if (width > 900) return 4;
        if (width > 600) return 3;
        return 2;
    }, [width]);

    // Filter and sort products based on debounced search and sort order
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        let productList = Array.isArray(products) ? products : Object.values(products);

        // Apply search filter
        if (debouncedSearch.trim()) {
            productList = productList.filter(product =>
                product.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                product.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
        }

        // Apply sorting
        switch (sortOrder) {
            case 'price_asc':
                return [...productList].sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price_desc':
                return [...productList].sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'rating':
                return [...productList].sort((a, b) => (b.rating || 0) - (a.rating || 0)); // Simplified rating sort
            default:
                return productList;
        }
    }, [products, debouncedSearch, sortOrder]);

    // Get top-rated product from favorites for banner
    const topFavorite = useMemo(() => {
        if (favorites.length === 0) return null;

        // Calculate rating for each favorite (including user reviews)
        const favoritesWithRating = favorites.map(fav => {
            const productReviews = reviews[fav.id] || [];
            const userAvgRating = productReviews.length > 0
                ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
                : 0;
            const combinedRating = productReviews.length > 0
                ? (fav.rating + userAvgRating) / 2
                : (fav.rating || 0);
            return { ...fav, combinedRating };
        });

        // Sort by rating and return top one
        return favoritesWithRating.sort((a, b) => b.combinedRating - a.combinedRating)[0];
    }, [favorites, reviews]);

    // Get current sort label for display
    const getSortLabel = () => {
        switch (sortOrder) {
            case 'price_asc': return '💰 Price: Low to High';
            case 'price_desc': return '💰 Price: High to Low';
            case 'rating': return '⭐ Best Rated';
            default: return 'No sorting';
        }
    };

    // Handle options/filter press
    const handleOptionsPress = () => {
        showAlert(
            '🔍 Filters',
            `Current sorting: ${getSortLabel()}`,
            [
                {
                    text: sortOrder === 'price_asc' ? '✓ Price: Low to High' : 'Price: Low to High',
                    onPress: () => {
                        setSortOrder('price_asc');
                        showAlert('✅ Filter Applied', 'Products sorted by price: low to high', [{ text: 'OK' }], 'checkmark-circle-outline');
                    }
                },
                {
                    text: sortOrder === 'price_desc' ? '✓ Price: High to Low' : 'Price: High to Low',
                    onPress: () => {
                        setSortOrder('price_desc');
                        showAlert('✅ Filter Applied', 'Products sorted by price: high to low', [{ text: 'OK' }], 'checkmark-circle-outline');
                    }
                },
                {
                    text: sortOrder === 'rating' ? '✓ Best Rated' : 'Best Rated',
                    onPress: () => {
                        setSortOrder('rating');
                        showAlert('✅ Filter Applied', 'Showing best rated products first', [{ text: 'OK' }], 'star-outline');
                    }
                },
                {
                    text: 'Clear Filters',
                    style: 'destructive',
                    onPress: () => {
                        setSortOrder('none');
                        showAlert('🔄 Filters Cleared', 'Showing products without sorting', [{ text: 'OK' }], 'refresh-outline');
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ],
            'options-outline'
        );
    };

    // Handle See All press
    const handleSeeAllPress = () => {
        dispatch(setCategorySelected(null));
        setSearchQuery('');
        setSortOrder('none');
    };

    // Dynamic styles based on theme
    const dynamicStyles = getDynamicStyles(isDarkMode, themeColors);

    // Show skeleton loader instead of ActivityIndicator
    if (loadingCategories || loadingProducts) {
        return (
            <SafeAreaView style={[styles.safeArea, dynamicStyles.background]} edges={['top']}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={themeColors.background} />
                <HomeSkeleton />
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView style={[styles.errorContainer, dynamicStyles.background]} edges={['top']}>
                <Ionicons name="cloud-offline-outline" size={60} color={colors.error} />
                <Text style={[styles.errorText, dynamicStyles.text]}>
                    Oops! Connection to TechZone servers failed.
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // User profile image (use Redux if available, otherwise default)
    const userProfileImage = profileImage || 'https://i.pravatar.cc/300?img=11';

    return (
        <SafeAreaView style={[styles.safeArea, dynamicStyles.background]} edges={['top']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={themeColors.background} />
            <CustomAlert {...alertConfig} onClose={hideAlert} />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIcon}>
                            <Ionicons name="flash" size={20} color={colors.white} />
                        </View>
                        <Text style={[styles.headerTitle, dynamicStyles.text]}>TechZone</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        {/* Offline indicator with user info */}
                        {isOffline && (
                            <View style={styles.offlineBadge}>
                                <Ionicons name="cloud-offline" size={16} color={colors.white} />
                            </View>
                        )}
                        {user && (
                            <View style={styles.userBadge}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                            </View>
                        )}
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
                            <Ionicons name="bag-outline" size={24} color={themeColors.text} />
                            {pendingSyncCount > 0 && (
                                <View style={styles.syncBadge}>
                                    <Ionicons name="cloud-offline" size={8} color={colors.white} />
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                            <Image source={{ uri: userProfileImage }} style={styles.profileImage} />
                            {user && (
                                <View style={styles.onlineIndicator} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar with Debounce */}
                <View style={[styles.searchContainer, dynamicStyles.card]}>
                    <Ionicons name="search-outline" size={20} color={themeColors.textLight} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search laptops, audio, accessories..."
                        placeholderTextColor={themeColors.textLight}
                        style={[styles.searchInput, dynamicStyles.text]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={themeColors.textLight} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={{ marginLeft: 8, position: 'relative' }} onPress={handleOptionsPress}>
                        <Ionicons name="options-outline" size={20} color={sortOrder !== 'none' ? colors.success : themeColors.primary} />
                        {sortOrder !== 'none' && (
                            <View style={styles.filterActiveBadge}>
                                <Ionicons name="checkmark" size={8} color={colors.white} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Debounce indicator */}
                {searchQuery !== debouncedSearch && (
                    <View style={styles.searchingIndicator}>
                        <Text style={[styles.searchingText, dynamicStyles.textLight]}>Searching...</Text>
                    </View>
                )}

                {/* Categories */}
                <View style={styles.categoriesContainer}>
                    <TouchableOpacity
                        style={[styles.categoryButton, dynamicStyles.card, !selectedCategory && styles.activeCategory]}
                        onPress={() => dispatch(setCategorySelected(null))}
                    >
                        <Ionicons name="grid" size={20} color={!selectedCategory ? colors.white : themeColors.text} style={{ marginRight: 8 }} />
                        <Text style={!selectedCategory ? styles.activeCategoryText : [styles.categoryText, dynamicStyles.text]}>All</Text>
                    </TouchableOpacity>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 8 }}>
                        {categories?.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.categoryButton, dynamicStyles.card, selectedCategory === cat.title && styles.activeCategory]}
                                onPress={() => dispatch(setCategorySelected(cat.title))}
                            >
                                <Ionicons
                                    name={cat.icon}
                                    size={20}
                                    color={selectedCategory === cat.title ? colors.white : themeColors.text}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={selectedCategory === cat.title ? styles.activeCategoryText : [styles.categoryText, dynamicStyles.text]}>
                                    {cat.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Banner - Shows top favorite or default */}
                <TouchableOpacity
                    style={styles.bannerContainer}
                    onPress={() => {
                        if (topFavorite) {
                            navigation.navigate('ProductDetail', { product: topFavorite });
                        } else if (filteredProducts.length > 0) {
                            navigation.navigate('ProductDetail', { product: filteredProducts[0] });
                        }
                    }}
                    activeOpacity={0.85}
                >
                    <ImageBackground
                        source={{ uri: topFavorite?.image || (filteredProducts && filteredProducts[0]?.image) || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2000&auto=format&fit=crop' }}
                        style={styles.bannerImage}
                        imageStyle={{ borderRadius: 24 }}
                    >
                        <View style={styles.bannerOverlay}>
                            <View style={styles.newBadge}>
                                <Text style={styles.newBadgeText}>
                                    {topFavorite ? '⭐ TOP FAVORITE' : 'NEW RELEASE'}
                                </Text>
                            </View>
                            <Text style={styles.bannerTitle}>
                                {topFavorite?.title || (filteredProducts && filteredProducts[0]?.title) || 'Latest Technology'}
                            </Text>
                            <Text style={styles.bannerSubtitle}>
                                {topFavorite
                                    ? `${topFavorite.combinedRating?.toFixed(1) || topFavorite.rating || 0}★ Rating • $${topFavorite.price}`
                                    : (filteredProducts && filteredProducts[0])
                                        ? `$${filteredProducts[0].price} • ${filteredProducts[0].category || 'Featured'}`
                                        : 'Discover our newest arrivals'
                                }
                            </Text>
                            <View style={styles.shopNowButton}>
                                <Text style={styles.shopNowText}>
                                    {topFavorite ? 'View Product' : 'Shop Now'}
                                </Text>
                                <Ionicons name="arrow-forward" size={16} color={colors.white} />
                            </View>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>

                {/* Trending Now */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, dynamicStyles.text]}>
                        {debouncedSearch ? `Results for "${debouncedSearch}"` : selectedCategory ? `${selectedCategory}` : 'Trending Now'}
                    </Text>
                    <TouchableOpacity onPress={handleSeeAllPress}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                {filteredProducts.length === 0 ? (
                    <View style={styles.noResults}>
                        <Ionicons name="search-outline" size={48} color={themeColors.textLight} />
                        <Text style={[styles.noResultsText, dynamicStyles.textLight]}>No products found</Text>
                    </View>
                ) : (
                    <View style={styles.productsList}>
                        <FlatList
                            key={numColumns}
                            data={filteredProducts}
                            renderItem={({ item }) => (
                                <ProductItem
                                    product={item}
                                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                                    containerStyle={{ width: (width - 40 - (numColumns - 1) * 16) / numColumns }}
                                    isDarkMode={isDarkMode}
                                />
                            )}
                            keyExtractor={item => item.id.toString()}
                            numColumns={numColumns}
                            columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between', marginBottom: 16 } : null}
                            scrollEnabled={false}
                        />
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

// Dynamic styles based on theme
const getDynamicStyles = (isDarkMode, themeColors) => StyleSheet.create({
    background: {
        backgroundColor: themeColors.background,
    },
    text: {
        color: themeColors.text,
    },
    textLight: {
        color: themeColors.textLight,
    },
    card: {
        backgroundColor: isDarkMode ? '#1C1C1E' : colors.white,
    },
});

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },
    offlineBadge: {
        backgroundColor: colors.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    userBadge: {
        marginRight: 8,
    },
    syncBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: colors.accent,
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileButton: {
        position: 'relative',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.success,
        borderWidth: 2,
        borderColor: colors.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    searchingIndicator: {
        paddingVertical: 4,
        marginBottom: 8,
    },
    searchingText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    categoriesContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
    },
    activeCategory: {
        backgroundColor: colors.primary,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    activeCategoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.white,
    },
    bannerContainer: {
        marginBottom: 20,
    },
    bannerImage: {
        height: 180,
        justifyContent: 'flex-end',
    },
    bannerOverlay: {
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 24,
    },
    newBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    newBadgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    bannerTitle: {
        color: colors.white,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        marginBottom: 12,
    },
    shopNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    shopNowText: {
        color: colors.white,
        fontWeight: '600',
        marginRight: 6,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    noResults: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    noResultsText: {
        marginTop: 12,
        fontSize: 16,
    },
    productsList: {
        marginBottom: 20,
    },
    filterActiveBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Home;
