import { isVideoRecord } from '../../../utils/categoryContent';
import { buildTree } from './lessonsHelpers';

const flattenTree = (nodes) => nodes.flatMap((node) => [node, ...flattenTree(node.children || [])]);

export const createLessonCatalogRepository = (client) => ({
  async load(selectedCategoryId) {
    const response = await client.get('/categories/all');
    const categories = (response.data?.data || []).filter((category) => !isVideoRecord(category));
    const mainNode = selectedCategoryId
      ? categories.find((category) => category._id === selectedCategoryId)
      : null;
    if (!mainNode) {
      return { categories, tree: buildTree(categories), topics: [], rootId: null };
    }

    const topics = buildTree(categories, selectedCategoryId);
    const tree = [{ ...mainNode, children: topics }];
    return { categories: flattenTree(tree), tree, topics, rootId: mainNode._id };
  },

  async loadPassedCategoryIds() {
    const response = await client.get('/exam-results/overview');
    return Array.isArray(response.data?.passedCategoryIds)
      ? [...new Set(response.data.passedCategoryIds)]
      : [];
  },
});
