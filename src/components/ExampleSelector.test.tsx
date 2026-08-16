import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExampleSelector from './ExampleSelector';
import { LanguageProvider } from '../contexts/LanguageContext';
import { examples, getCategoryName, type ExampleCategory } from '../utils/examples';

const categories = Object.keys(examples) as ExampleCategory[];

function setup() {
  const onSelectExample = vi.fn();
  render(
    <LanguageProvider>
      <ExampleSelector onSelectExample={onSelectExample} />
    </LanguageProvider>,
  );
  return { onSelectExample, user: userEvent.setup() };
}

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getAllByRole('button')[0]);
};

describe('ExampleSelector', () => {
  it('starts closed', () => {
    setup();
    expect(screen.queryByText(getCategoryName('flowchart', 'en'))).not.toBeInTheDocument();
  });

  it('lists every category once opened', async () => {
    const { user } = setup();
    await openMenu(user);
    for (const category of categories) {
      expect(screen.getByText(getCategoryName(category, 'en'))).toBeInTheDocument();
    }
  });

  it('covers all 31 diagram-type categories', async () => {
    // Guards the example catalogue against silently shrinking.
    const { user } = setup();
    await openMenu(user);
    expect(categories.length).toBe(31);
  });

  it('reveals a category\'s examples only after it is expanded', async () => {
    const { user } = setup();
    await openMenu(user);
    const first = examples.flowchart[0];

    expect(screen.queryByText(first.name.en)).not.toBeInTheDocument();
    await user.click(screen.getByText(getCategoryName('flowchart', 'en')));
    expect(screen.getByText(first.name.en)).toBeInTheDocument();
  });

  it('hands back the example code when one is chosen', async () => {
    const { onSelectExample, user } = setup();
    await openMenu(user);
    await user.click(screen.getByText(getCategoryName('mindmap', 'en')));
    await user.click(screen.getByText(examples.mindmap[0].name.en));

    expect(onSelectExample).toHaveBeenCalledWith(
      examples.mindmap[0].code.en,
      examples.mindmap[0].id,
    );
  });

  it('closes the menu after a selection', async () => {
    const { user } = setup();
    await openMenu(user);
    await user.click(screen.getByText(getCategoryName('timeline', 'en')));
    await user.click(screen.getByText(examples.timeline[0].name.en));

    expect(screen.queryByText(getCategoryName('flowchart', 'en'))).not.toBeInTheDocument();
  });

  it('shows the chosen example name on the trigger button', async () => {
    const { user } = setup();
    await openMenu(user);
    await user.click(screen.getByText(getCategoryName('kanban', 'en')));
    await user.click(screen.getByText(examples.kanban[0].name.en));

    const trigger = screen.getAllByRole('button')[0];
    expect(within(trigger).getByText(examples.kanban[0].name.en)).toBeInTheDocument();
  });

  it('collapses one category when another is expanded', async () => {
    const { user } = setup();
    await openMenu(user);
    await user.click(screen.getByText(getCategoryName('flowchart', 'en')));
    expect(screen.getByText(examples.flowchart[0].name.en)).toBeInTheDocument();

    await user.click(screen.getByText(getCategoryName('sequence', 'en')));
    expect(screen.queryByText(examples.flowchart[0].name.en)).not.toBeInTheDocument();
    expect(screen.getByText(examples.sequence[0].name.en)).toBeInTheDocument();
  });
});
