import Personalize from '@contentstack/personalize-edge-sdk';

export const initializePersonalize = async (request, CONTENTSTACK_PERSONALIZE_EDGE_API_URL, CONTENTSTACK_PERSONALIZE_PROJECT_UID) => {
    try {
        if (CONTENTSTACK_PERSONALIZE_EDGE_API_URL) {
            Personalize.setEdgeApiUrl(CONTENTSTACK_PERSONALIZE_EDGE_API_URL);
        }

        const personalize = await Personalize.init(CONTENTSTACK_PERSONALIZE_PROJECT_UID, {
            request,
        });

        const variantParam = personalize.getVariantParam();

        return { variantParam, personalize };
    } catch (error) {
        return { variantParam: null, personalize: null, error: error };
    }
};