const Product = require("./Product.js");

const productSortOptions = {
  recent: { createdAt: -1, _id: -1 },
};

async function listProducts(req, res, next) {
  const {
    offset = "0",
    limit = "10",
    keyword = "",
    orderBy = "recent",
  } = req.query;

  const skip = Number(offset);
  const size = Number(limit);

  if (
    typeof offset !== "string" ||
    !/^\d+$/.test(offset) ||
    !Number.isSafeInteger(skip) ||
    typeof limit !== "string" ||
    !/^\d+$/.test(limit) ||
    size < 1 ||
    size > 100 ||
    typeof keyword !== "string" ||
    typeof orderBy !== "string" ||
    !Object.hasOwn(productSortOptions, orderBy)
  ) {
    return res
      .status(400)
      .json({ message: "검색 또는 페이지 설정을 확인해 주세요." });
  }

  const search = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  try {
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .select("name price createdAt")
        .sort(productSortOptions[orderBy])
        .skip(skip)
        .limit(size),
      Product.countDocuments(filter),
    ]);

    res.json({
      list: products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        createdAt: product.createdAt,
      })),
      totalCount,
    });
  } catch (error) {
    next(error);
  }
}

function formatProduct(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    tags: product.tags,
    createdAt: product.createdAt,
  };
}

async function createProduct(req, res, next) {
  const { name, description, price, tags } = req.body ?? {};

  try {
    const product = await Product.create({ name, description, price, tags });
    res.status(201).json(formatProduct(product));
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "상품 정보를 확인해 주세요." });
    }
    next(error);
  }
}

async function getProduct(req, res, next) {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.json(formatProduct(product));
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  const { id } = req.params;

  const updates = {};
  for (const field of ["name", "description", "price", "tags"]) {
    if (Object.hasOwn(req.body ?? {}, field)) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ message: "수정할 상품 정보를 입력해 주세요." });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: "after", runValidators: true },
    );

    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.json(formatProduct(product));
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "상품 정보를 확인해 주세요." });
    }
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};
