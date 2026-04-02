function AppContent() {
    const { theme } = useTheme();
    const [isReady, setIsReady] = useState(false);
    const [showCustomSplash, setShowCustomSplash] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initialProfiles, setInitialProfiles] = useState<any[]>([]);

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        try {
            console.log('🚀 App Initialization Starting...');

            // Initialize critical services in parallel
            const promises: Promise<any>[] = [
                SubscriptionService.initialize()
            ];

            // Initialize database only on native platforms
            if (Platform.OS !== 'web') {
                promises.push(initDatabase());
            }

            await Promise.all(promises);
            console.log('✅ Database and Subscription ready');

            // Load profiles AFTER database is ready (only on native)
            if (Platform.OS !== 'web') {
                const profiles = await ProfileRepository.getAll();
                console.log('✅ Profiles loaded:', profiles.length);
                setInitialProfiles(profiles);
            }

            setIsReady(true);
            console.log('🎉 App fully initialized');
        } catch (err) {
            console.error('Initialization error:', err);
            setError('Failed to initialize app. Please restart.');
        }
    };

    // Show custom splash screen
    if (showCustomSplash) {
        return <CustomSplashScreen isReady={isReady} onFinish={() => setShowCustomSplash(false)} />;
    }

    if (error) {
        return (
            <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.errorText, { color: theme.colors.brand.toxic }]}>
                    {error}
                </Text>
            </View>
        );
    }

    if (!isReady) {
        // Return null so the Splash Screen remains visible
        return null;
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar style={theme.isDark ? 'light' : 'dark'} />
            <ProfileProvider initialProfiles={initialProfiles}>
                <RootNavigator />
            </ProfileProvider>
        </View>
    );
}
