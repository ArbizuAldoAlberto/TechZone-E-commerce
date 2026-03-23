import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    useWindowDimensions,
    FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useGetCategoriesQuery, useGetProductsQuery } from '../../services/shopService';
import { setCategorySelected } from '../../store/shopSlice';
import { useDebounce } from '../../app/hooks';
import { COLORS, FONTS, SPACING } from '../../theme';
import { useCustomAlert } from '../../components/common/CustomAlert';

import ProductItem from '../../components/ProductItem';
import { HomeSkeleton } from '../../components/common/SkeletonLoader';
import CustomAlert from '../../components/common/CustomAlert';
import ParticlesBackground from '../../components/3d/ParticlesBackground';
import InputField from '../../components/common/InputField';
import ProductRow from '../../components/home/ProductRow';
import PromoBanner from '../../components/home/PromoBanner';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientText } from '../../components/ui/GradientText';
import { NeoButton } from '../../components/ui/NeoButton';

// Extracted Components
import { HomeHeader } from '../../components/home/HomeHeader';
import { CategorySelector } from '../../components/home/CategorySelector';
import { HeroSection } from '../../components/home/HeroSection';

/**
 * @component Home
 * @description Main dashboard component. Elite Edition.
 */
const Home = ({ navigation }) => {
    const dispatch = useDispatch();
    const { alertConfig, hideAlert } = useCustomAlert();
    const { width } = useWindowDimensions();

    // Selectors
    const selectedCategory = useSelector(state => state.shop.selectedCategory);
    const profileImage = useSelector(state => state.auth.profileImage);
    const isDarkMode = useSelector(state => state.theme.isDarkMode);

    const [searchQuery, setSearchQuery] = useState('');
    const [priceFilter, setPriceFilter] = useState({ min: 0, max: 9999 });
    const [showFilters, setShowFilters] = useState(false);
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Queries
    const { data: categories, isLoading: loadingCategories } = useGetCategoriesQuery();
    const { data: products, isLoading: loadingProducts, isError, refetch } = useGetProductsQuery(selectedCategory);

    const userProfileImage = profileImage || 'https://i.pravatar.cc/300?img=11';

    /**
     * @description Optimizes product filtering based on search query, category, and price range.
     * UseMemo prevents expensive recalculations on every render.
     */
    const { productList, newArrivals } = useMemo(() => {
        const list = products || [];
        const query = debouncedSearch.toLowerCase().trim();
        const hasActiveFilter = query || priceFilter.min > 0 || priceFilter.max < 9999;

        if (hasActiveFilter) {
            const filtered = list.filter(p => {
                const matchesSearch = !query || p.title?.toLowerCase().includes(query) || p.category?.toLowerCase().includes(query);
                const matchesPrice = p.price >= priceFilter.min && p.price <= priceFilter.max;
                return matchesSearch && matchesPrice;
            });
            return { productList: filtered, newArrivals: [] };
        }

        return {
            productList: list,
            newArrivals: list.slice(0, 20)
        };
    }, [products, debouncedSearch, priceFilter]);

    // Error/Loading States
    if (loadingCategories || loadingProducts) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <StatusBar barStyle="light-content" />
                <HomeSkeleton />
            </SafeAreaView>
        );
    }

    if (isError && (!products || products.length === 0)) {
        return (
            <SafeAreaView style={styles.centerContainer} edges={['top']}>
                <Ionicons name="cloud-offline-outline" size={64} color={COLORS.cta} />
                <GradientText style={styles.errorText}>Connection Failed</GradientText>
                <NeoButton title="Retry" onPress={refetch} />
            </SafeAreaView>
        );
    }

    const renderHeader = () => (
        <View style={{ gap: SPACING.lg }}>
            <HomeHeader
                title="TechZone"
                onProfilePress={() => navigation.navigate('Profile')}
                profileImage={userProfileImage}
                isDarkMode={isDarkMode}
            />

            <View style={styles.searchSection}>
                <View style={styles.searchRow}>
                    <View style={{ flex: 1 }}>
                        <InputField
                            placeholder="Search products, categories..."
                            icon="search-outline"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            darkMode={isDarkMode}
                            style={{ backgroundColor: isDarkMode ? COLORS.secondary : COLORS.white, borderColor: isDarkMode ? COLORS.secondary : COLORS.gray, marginBottom: 0 }}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.filterBtn, { backgroundColor: showFilters ? COLORS.cta : (isDarkMode ? COLORS.secondary : '#F1F5F9') }]}
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <Ionicons name="options-outline" size={22} color={showFilters ? COLORS.white : (isDarkMode ? COLORS.white : COLORS.primary)} />
                    </TouchableOpacity>
                </View>

                {showFilters && (
                    <Animated.View entering={FadeInDown.duration(300)} style={styles.filterPanel}>
                        <Text style={[styles.filterTitle, { color: isDarkMode ? COLORS.white : COLORS.primary }]}>Price Range</Text>
                        <View style={styles.priceButtons}>
                            {[{ label: 'All', min: 0, max: 9999 }, { label: '$0-50', min: 0, max: 50 }, { label: '$50-200', min: 50, max: 200 }, { label: '$200-500', min: 200, max: 500 }, { label: '$500+', min: 500, max: 9999 }].map((range) => (
                                <TouchableOpacity
                                    key={range.label}
                                    style={[
                                        styles.priceBtn,
                                        (priceFilter.min === range.min && priceFilter.max === range.max) && styles.priceBtnActive
                                    ]}
                                    onPress={() => setPriceFilter({ min: range.min, max: range.max })}
                                >
                                    <Text style={[
                                        styles.priceBtnText,
                                        (priceFilter.min === range.min && priceFilter.max === range.max) && styles.priceBtnTextActive
                                    ]}>{range.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                )}
            </View>

            <CategorySelector
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={(id) => dispatch(setCategorySelected(id))}
                isDarkMode={isDarkMode}
            />

            {!debouncedSearch && (
                <Animated.View entering={FadeInDown.duration(600).springify()}>
                    <HeroSection isDarkMode={isDarkMode} />

                    <ProductRow
                        title="New Arrivals"
                        products={newArrivals}
                        navigation={navigation}
                        isDarkMode={isDarkMode}
                    />

                    <GlassCard style={{ marginHorizontal: SPACING.lg, marginVertical: SPACING.md, padding: 0, borderColor: isDarkMode ? COLORS.glassBorder : 'rgba(0,0,0,0.1)' }}>
                        <PromoBanner
                            title="Cyber Week"
                            subtitle="50% OFF Audio"
                            image="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80"
                            onPress={() => { }}
                            style={{ margin: 0, borderRadius: 16 }}
                        />
                    </GlassCard>

                    <GradientText style={[styles.sectionHeader, { marginLeft: SPACING.lg, marginTop: SPACING.lg, color: isDarkMode ? COLORS.white : COLORS.primary }]}>
                        Explore Collection
                    </GradientText>
                </Animated.View>
            )}

            {debouncedSearch && <GradientText style={[styles.sectionHeader, { marginLeft: SPACING.lg, color: isDarkMode ? COLORS.white : COLORS.primary }]}>Results</GradientText>}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

            {/* Background Layer - Dynamic */}
            <View style={[styles.bgLayer, { backgroundColor: isDarkMode ? COLORS.primary : COLORS.background }]}>
                {/* Re-using ParticlesBackground but ensuring it fits the new theme */}
                <ParticlesBackground />
            </View>

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <CustomAlert {...alertConfig} onClose={hideAlert} />

                <FlatList
                    data={productList}
                    numColumns={2}
                    removeClippedSubviews={true}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInUp.delay(index * 80).springify().damping(15)}>
                            <ProductItem
                                product={item}
                                onPress={() => navigation.navigate('ProductDetail', { product: item })}
                                containerStyle={[styles.gridItem, { width: (width - SPACING.lg * 2 - SPACING.md) / 2 }]}
                                isDarkMode={isDarkMode}
                            />
                        </Animated.View>
                    )}
                    ListHeaderComponent={renderHeader()}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cube-outline" size={64} color={isDarkMode ? COLORS.secondary : COLORS.secondary} />
                            <Text style={[styles.emptyText, { color: isDarkMode ? COLORS.textLight : COLORS.secondary }]}>
                                No products found
                            </Text>
                            <Text style={[styles.emptySubtext, { color: isDarkMode ? COLORS.secondary : '#78716C' }]}>
                                Try selecting a different category
                            </Text>
                        </View>
                    }
                    columnWrapperStyle={productList.length > 0 ? { justifyContent: 'space-between', paddingHorizontal: SPACING.lg, gap: SPACING.md } : undefined}
                    contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={6}
                    keyExtractor={item => item.id?.toString() || Math.random().toString()}
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    bgLayer: { ...StyleSheet.absoluteFillObject, zIndex: -1, backgroundColor: COLORS.primary },
    safeArea: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

    searchSection: { paddingHorizontal: SPACING.lg },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm
    },
    filterBtn: {
        width: 50,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)'
    },
    filterPanel: {
        marginTop: SPACING.md,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 16
    },
    filterTitle: {
        fontSize: 14,
        fontFamily: FONTS.body,
        fontWeight: '700',
        marginBottom: SPACING.sm,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    priceButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    priceBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)'
    },
    priceBtnActive: {
        backgroundColor: COLORS.cta,
        borderColor: COLORS.cta
    },
    priceBtnText: {
        fontSize: 13,
        fontFamily: FONTS.body,
        fontWeight: '600',
        color: COLORS.secondary
    },
    priceBtnTextActive: {
        color: COLORS.white
    },

    sectionHeader: {
        fontSize: 22,
        marginBottom: SPACING.md,
        color: COLORS.white
    },
    gridItem: {
        marginBottom: SPACING.md
    },
    errorText: { fontSize: 18, marginVertical: SPACING.md, color: COLORS.text },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        gap: SPACING.md
    },
    emptyText: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        marginTop: SPACING.md
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: FONTS.regular
    }
});

export default Home;
