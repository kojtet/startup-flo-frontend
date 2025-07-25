import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, TrendingUp, TrendingDown, Plus, BarChart3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCategories } from './useCategories';
import { CategoryForm } from './CategoryForm';
import { CategoryCard } from './CategoryCard';
import { CategoryFilters } from './CategoryFilters';
import { CategoryPagination } from './CategoryPagination';

export function CategoriesSection() {
  const {
    // State
    categories,
    filteredCategories,
    paginatedCategories,
    incomeCategories,
    expenseCategories,
    isLoadingCategories,
    categoriesError,
    searchTerm,
    typeFilter,
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedCategory,
    formData,
    
    // Pagination state
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    
    // Actions
    setSearchTerm,
    setTypeFilter,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setFormData,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    openEditDialog,
    fetchCategories,
    
    // Pagination actions
    goToPage,
    goToNextPage,
    goToPreviousPage
  } = useCategories();

  if (categoriesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{categoriesError}</p>
        <Button onClick={() => fetchCategories()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="h-8 w-8" />
            Categories
          </h1>
          <p className="text-gray-600 mt-2">Organize your income and expense transactions with categories</p>
        </div>
        
        <div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incomeCategories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Categories</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenseCategories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Recent</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {categories.length > 0 
                ? categories[categories.length - 1]?.name 
                : 'No categories'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <CategoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        onCreateClick={() => setIsCreateDialogOpen(true)}
      />

      {/* Categories List */}
      {isLoadingCategories ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-2 text-gray-600">Loading categories...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <BarChart3 className="h-4 w-4" />
              <span>Showing {filteredCategories.length} of {categories.length} categories</span>
              {totalPages > 1 && (
                <span className="text-blue-600">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </div>
          )}
          
          <div className="grid gap-4">
            {paginatedCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={openEditDialog}
                onDelete={handleDeleteCategory}
              />
            ))}
            {filteredCategories.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Tag className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                  <p className="text-gray-600 text-center mb-4">
                    {searchTerm || typeFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Get started by creating your first category'
                    }
                  </p>
                  {!searchTerm && typeFilter === 'all' && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Category
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <CategoryPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              onNextPage={goToNextPage}
              onPreviousPage={goToPreviousPage}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredCategories.length}
            />
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your financial transactions.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreateCategory}
            isLoading={isLoadingCategories}
            submitLabel="Create Category"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category details and settings.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateCategory}
            isLoading={isLoadingCategories}
            submitLabel="Update Category"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 