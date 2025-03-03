document.addEventListener('DOMContentLoaded', function () {
    // Check user logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userName').textContent = currentUser.name;

    setTimeout(showSalePopup, 3500);

    document.getElementById('logoutBtn').addEventListener('click', function () {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    const fakeStoreBtn = document.getElementById('fakeStoreBtn');
    const dummyJsonBtn = document.getElementById('dummyJsonBtn');
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');
    const categoryButtons = document.getElementById('categoryButtons');
    const toast = document.getElementById('toast');

    let allProducts = [];
    let categories = [];
    let currentApiSource = 'fakestore';

    updateCartCount();

    fetchProducts('fakestore');

    // toggle buttons
    fakeStoreBtn.addEventListener('click', function () {
        setActiveButton(fakeStoreBtn);
        currentApiSource = 'fakestore';
        fetchProducts('fakestore');
    });

    dummyJsonBtn.addEventListener('click', function () {
        setActiveButton(dummyJsonBtn);
        currentApiSource = 'dummyjson';
        fetchProducts('dummyjson');
    });

    // search input
    searchInput.addEventListener('input', function () {
        filterProducts();
    });

    categorySelect.addEventListener('change', function () {
        const buttons = categoryButtons.querySelectorAll('.category-button');
        buttons.forEach(btn => btn.classList.remove('active'));

        filterProducts();
    });

    function setActiveButton(button) {
        fakeStoreBtn.classList.remove('active');
        dummyJsonBtn.classList.remove('active');
        button.classList.add('active');
    }

    // fetcj products from selected API
    function fetchProducts(apiSource) {
        const loadingElement = document.getElementById('loading');
        const productsContainer = document.getElementById('productsContainer');

        // loading indicator
        loadingElement.style.display = 'block';
        productsContainer.innerHTML = '';

        let apiUrl = '';
        if (apiSource === 'fakestore') {
            apiUrl = 'https://fakestoreapi.com/products';
        } else {
            apiUrl = 'https://dummyjson.com/products';
        }

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // loading indi ---- (HIDE)
                loadingElement.style.display = 'none';

                let products = [];
                if (apiSource === 'dummyjson') {
                    products = data.products;
                } else {
                    products = data;
                }

                allProducts = products;

                extractCategories(products, apiSource);

                displayProducts(products);
            })
            .catch(error => {
                loadingElement.textContent = 'Error loading products: ' + error.message;
                console.error('Error fetching products:', error);
            });
    }

    // unique categories from api response
    function extractCategories(products, apiSource) {
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }

        categoryButtons.innerHTML = '';

        categories = [...new Set(products.map(product =>
            apiSource === 'dummyjson' ? product.category : product.category
        ))];

        categories.sort();

        const allButton = document.createElement('span');
        allButton.className = 'category-button active';
        allButton.textContent = 'All';
        allButton.dataset.category = '';
        allButton.addEventListener('click', function () {
            setCategoryFilter('');
        });
        categoryButtons.appendChild(allButton);

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categorySelect.appendChild(option);

            const button = document.createElement('span');
            button.className = 'category-button';
            button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            button.dataset.category = category;
            button.addEventListener('click', function () {
                setCategoryFilter(category);
            });
            categoryButtons.appendChild(button);
        });
    }

    function setCategoryFilter(category) {
        categorySelect.value = category;

        const buttons = categoryButtons.querySelectorAll('.category-button');
        buttons.forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        filterProducts();
    }

    function filterProducts() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedCategory = categorySelect.value;

        let filteredProducts = allProducts;

        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product => {
                const title = currentApiSource === 'dummyjson' ?
                    product.title.toLowerCase() : product.title.toLowerCase();
                return title.includes(searchTerm);
            });
        }

        // Filter by category
        if (selectedCategory) {
            filteredProducts = filteredProducts.filter(product => {
                const category = currentApiSource === 'dummyjson' ?
                    product.category : product.category;
                return category === selectedCategory;
            });
        }

        displayProducts(filteredProducts);
    }

    // Display products in the container
    function displayProducts(products) {
        const productsContainer = document.getElementById('productsContainer');
        productsContainer.innerHTML = '';

        if (products.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No products found matching your criteria.';
            productsContainer.appendChild(noResults);
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            // Adjust property names based on API
            let imageUrl, title, price, category, id;

            if (currentApiSource === 'dummyjson') {
                id = product.id;
                imageUrl = product.thumbnail;
                title = product.title;
                price = product.price;
                category = product.category;
            } else {
                id = product.id;
                imageUrl = product.image;
                title = product.title;
                price = product.price;
                category = product.category;
            }

            productCard.innerHTML = `
                        <div class="product-image">
                            <img src="${imageUrl}" alt="${title}">
                        </div>
                        <div class="product-title">${title}</div>
                        <div class="product-price">$${price.toFixed(2)}</div>
                        <div class="product-category">${category}</div>
                        <button class="add-to-cart" data-id="${id}" data-api="${currentApiSource}">Add to Cart</button>
                    `;

            productsContainer.appendChild(productCard);
        });

        // "Add to Cart" buttons -- (EVENT LOSTEn)
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function () {
                const productId = this.dataset.id;
                const apiSource = this.dataset.api;

                const product = allProducts.find(p => p.id.toString() === productId);
                if (product) {
                    addToCart(product, apiSource);
                }
            });
        });
    }

    // Add product to cart
    function addToCart(product, apiSource) {
        // localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        const cartProduct = {
            id: product.id,
            title: product.title,
            price: product.price,
            image: apiSource === 'dummyjson' ? product.thumbnail : product.image,
            quantity: 1,
            apiSource: apiSource
        };

        const existingProductIndex = cart.findIndex(item =>
            item.id === product.id && item.apiSource === apiSource
        );

        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += 1;
            showToast(`Increased quantity for ${product.title}`);
        } else {
            cart.push(cartProduct);
            showToast(`${product.title} added to cart`);
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        updateCartCount();
    }

    //  toast notification
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 2500);
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cartCount').textContent = totalItems;
    }

    // Sale popup
    function showSalePopup() {
        const salePopup = document.getElementById('salePopup');
        salePopup.style.display = 'flex';

        const closePopup = document.querySelector('.close-popup');
        closePopup.addEventListener('click', function() {
            salePopup.style.display = 'none';
        });

        salePopup.addEventListener('click', function(event) {
            if (event.target === salePopup) {
                salePopup.style.display = 'none';
            }
        });

        const shopNowBtn = document.querySelector('.shop-now-btn');
        shopNowBtn.addEventListener('click', function() {
            salePopup.style.display = 'none';
            document.querySelector('h2:contains("Products")').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
});