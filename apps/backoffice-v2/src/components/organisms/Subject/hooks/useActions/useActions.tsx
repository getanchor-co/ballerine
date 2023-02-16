import { useCallback } from 'react';
import { useApproveEndUserMutation } from '../../../../../lib/react-query/mutations/useApproveEndUserMutation/useApproveEndUserMutation';
import { useRejectEndUserMutation } from '../../../../../lib/react-query/mutations/useRejectEndUserMutation/useRejectEndUserMutation';
import { useEndUserQuery } from '../../../../../lib/react-query/queries/useEndUserQuery/useEndUserQuery';
import { useDebounce } from 'hooks/useDebounce/useDebounce';
import { useDocumentListener } from 'hooks/useDocumentListener/useDocumentListener';
import { useSelectNextEndUser } from 'hooks/useSelectNextEndUser/useSelectNextEndUser';

export const useActions = (endUserId: string) => {
  const onSelectNextEndUser = useSelectNextEndUser();
  const { mutate: mutateApproveEndUser, isLoading: isLoadingApproveEndUser } =
    useApproveEndUserMutation(endUserId, onSelectNextEndUser);
  const { mutate: mutateRejectEndUser, isLoading: isLoadingRejectEndUser } =
    useRejectEndUserMutation(endUserId, onSelectNextEndUser);
  const { isLoading: isLoadingEndUser } = useEndUserQuery(endUserId);
  const isLoading =
    isLoadingApproveEndUser || isLoadingRejectEndUser || isLoadingEndUser;

  // Only display the button spinners if the request is longer than 300ms
  const debouncedIsLoadingRejectEndUser = useDebounce(
    isLoadingRejectEndUser,
    300,
  );
  const debouncedIsLoadingApproveEndUser = useDebounce(
    isLoadingApproveEndUser,
    300,
  );

  // Avoid passing the onClick event to mutate
  const onMutateApproveEndUser = useCallback(
    () => mutateApproveEndUser(),
    [mutateApproveEndUser],
  );
  const onMutateRejectEndUser = useCallback(
    () => mutateRejectEndUser(),
    [mutateRejectEndUser],
  );

  useDocumentListener('keydown', event => {
    if (!event.ctrlKey || document.activeElement !== document.body) return;

    event.preventDefault();

    switch (event.key) {
      case 'ArrowDown':
        onSelectNextEndUser();
        break;

      // Approve end user on 'Ctrl + A'
      case 'a':
        onMutateApproveEndUser();
        break;

      // Approve end user on 'Ctrl + J'
      case 'j':
        onMutateRejectEndUser();
        break;
    }
  });

  return {
    onMutateApproveEndUser,
    onMutateRejectEndUser,
    debouncedIsLoadingRejectEndUser,
    debouncedIsLoadingApproveEndUser,
    isLoading,
    isLoadingEndUser,
  };
};